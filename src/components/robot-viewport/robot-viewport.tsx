import { Environment, Html, OrbitControls, useProgress } from "@react-three/drei";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { AxesHelper, ColorRepresentation, DirectionalLight, Object3D, Vector3, Vector3Tuple } from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { ArmState } from "../arm-viewport/arm-viewport";
import { createFourbarLinkageSolver } from "@/inverse-kinematics";
import { lawOfCosinesAngle, lawOfCosinesSide } from "@/math";


function Loader() {
    const { progress } = useProgress()
    return <Html center>{progress} % loaded</Html>
}




function findThreeSubobject(object: Object3D, key:string) : Object3D|null {
    const subobject = object.children.find((child) => child.name === key);
    if(subobject == null) {
        console.error(key, " not found in ", object);
        return null;
    }else{
        return subobject;
    }
    
}

function useThreeSubobject(object : Object3D, name: string) {
    return useMemo(() => findThreeSubobject(object, name) ?? new Object3D(), [object, name]);
}

const DEG_TO_RAD = Math.PI / 180;

// function useMemoWithCleanup(memo, deps, cleanup) {
//     return useEffect();
// }


function useArm(mountPoint: Object3D, { rotunda, elbow, shoulder, wristRoll, wristPitch, effectorPosition } : ArmState) {
    const armGltf = useLoader(GLTFLoader, "/models/Arm-High-Quality.glb");
    const arm = useMemo(() => {
        const arm = armGltf.scene.children[0].clone(true);
        mountPoint.add(arm);
        return arm;
    }, [armGltf, mountPoint]);

    const rotundaObj = arm
    const shoulderObj = useThreeSubobject(rotundaObj, "Shoulder");
    const elbowObj = useThreeSubobject(shoulderObj, "Elbow");
    const wristPitchObj = useThreeSubobject(elbowObj, "Wrist_Pitch");
    const wristRollObj = useThreeSubobject(wristPitchObj, "Wrist_Roll");

    const rightLinkage1Obj = useThreeSubobject(wristRollObj, "Right_Linkage_1")
    const rightLinkage2Obj = useThreeSubobject(rightLinkage1Obj, "Right_Linkage_2")
    const rightLinkage3Obj = useThreeSubobject(rightLinkage2Obj, "Right_Linkage_3") 
    const rightLinkage4Obj = useThreeSubobject(rightLinkage3Obj, "Right_Linkage_4")
    const rightLinkage5Obj = useThreeSubobject(rightLinkage4Obj, "Right_Linkage_5") 

    const leftLinkage1Obj = useThreeSubobject(wristRollObj, "Left_Linkage_1")
    const leftLinkage2Obj = useThreeSubobject(leftLinkage1Obj, "Left_Linkage_2")
    const leftLinkage3Obj = useThreeSubobject(leftLinkage2Obj, "Left_Linkage_3")
    const leftLinkage4Obj = useThreeSubobject(leftLinkage3Obj, "Left_Linkage_4")
    const leftLinkage5Obj = useThreeSubobject(leftLinkage4Obj, "Left_Linkage_5")

    const fourBarSolver = useMemo(() => {
        const d = rightLinkage2Obj.position.length();
        const a = rightLinkage3Obj.position.length();
        const b = rightLinkage4Obj.position.length();
        const c = rightLinkage5Obj.position.length();

        const initialAngle = rightLinkage2Obj.position.clone().multiplyScalar(-1).angleTo(rightLinkage3Obj.position);
        
        const solve = createFourbarLinkageSolver(a, b, c, d);

        return (theta : number) => {
            const [ a, b, c, d ] = solve(-theta + initialAngle);
            return [
                theta,
                b,
                c,
                d
            ]
        }
    }, [ rightLinkage2Obj, rightLinkage3Obj, rightLinkage4Obj, rightLinkage5Obj ]);

    rotundaObj.setRotationFromAxisAngle(new Vector3(0, 1, 0), rotunda);
    shoulderObj.setRotationFromAxisAngle(new Vector3(1, 0, 0), shoulder);
    elbowObj.setRotationFromAxisAngle(new Vector3(1, 0, 0), elbow);
    wristPitchObj.setRotationFromAxisAngle(new Vector3(1, 0, 0), wristPitch);
    wristRollObj.setRotationFromAxisAngle(new Vector3(0, 0, 1), wristRoll);

    const linkageAngles = fourBarSolver(effectorPosition);

    rightLinkage2Obj.setRotationFromAxisAngle(new Vector3(0, 1, 0), linkageAngles[0]);
    rightLinkage3Obj.setRotationFromAxisAngle(new Vector3(0, 1, 0), Math.PI-linkageAngles[1]);
    rightLinkage4Obj.setRotationFromAxisAngle(new Vector3(0, 1, 0), Math.PI-linkageAngles[2]);
    
    leftLinkage2Obj.setRotationFromAxisAngle(new Vector3(0, 1, 0), -linkageAngles[0]);
    leftLinkage3Obj.setRotationFromAxisAngle(new Vector3(0, 1, 0), -Math.PI+linkageAngles[1]);
    leftLinkage4Obj.setRotationFromAxisAngle(new Vector3(0, 1, 0), -Math.PI+linkageAngles[2]);

    return [
        arm
    ];
}

function useChassi() {
    const chassiGltf = useLoader(GLTFLoader, "/models/Chassi-High-Quality.glb");

    const chassi = useMemo(() => {
        return chassiGltf.scene.children[0].clone(true)
    }, [chassiGltf]);

    const suspensionMountPointFR = useThreeSubobject(chassi, "Suspension_Mount_Point_FR");
    const suspensionMountPointFL = useThreeSubobject(chassi, "Suspension_Mount_Point_FL");
    const suspensionMountPointb = useThreeSubobject(chassi, "Suspension_Mount_Point_B");

    const rotundaMountPoint = useThreeSubobject(chassi, "Rotunda_Mount_Point");
    const scienceMountPoint = useThreeSubobject(chassi, "Science_Mount_Point");

    return [
        chassi,
        suspensionMountPointFR,
        suspensionMountPointFL,
        suspensionMountPointb,

        rotundaMountPoint,
        scienceMountPoint,
    ];
}

interface SuspensionSettings {

};

function useSuspension(mountPoint : Object3D, angle : number) {
    const suspensionGltf = useLoader(GLTFLoader, "/models/Suspension-High-Quality.glb");

    const suspension = useMemo(() => {
        const suspension = suspensionGltf.scene.children[0].clone(true);
        mountPoint.add(suspension);
        return suspension;
    }, [suspensionGltf, mountPoint]);

    const lowerSuspension = useThreeSubobject(suspension, "Lower_Suspension_Joint");
    const wheelMountPoint = useThreeSubobject(lowerSuspension, "Wheel_Mount_Point");
    const upperSuspension = useThreeSubobject(suspension, "Upper_Suspension_Joint");
    const upperSuspensionSocket = useThreeSubobject(upperSuspension, "Upper_Socket_Joint");
    const shockUpper = useThreeSubobject(suspension, "Upper_Shock_Joint");
    const shockLower = useThreeSubobject(lowerSuspension, "Lower_Shock_Joint");

    const shockSolve = useMemo(() => {
        const shockUpperAngleWithLinkage = Math.atan((shockUpper.position.z - lowerSuspension.position.z) / (shockUpper.position.y - lowerSuspension.position.y));
        const shockLowerAngleWithLinkage = Math.atan2(shockLower.position.y, shockLower.position.z);
        const shockLowerAngleWithLinkageCompliment = Math.PI/2 - shockLowerAngleWithLinkage;
        const a = shockUpper.position.clone().sub(lowerSuspension.position).length();
        const b = shockLower.position.length();
        console.log(shockLowerAngleWithLinkage, a, b, shockUpperAngleWithLinkage);
    
        return (theta : number) => {
            const c = lawOfCosinesSide(Math.PI/2 + theta - shockLowerAngleWithLinkage - shockUpperAngleWithLinkage, a, b);
            const upperShockAngle = lawOfCosinesAngle(b, a, c);
            const lowerShockAngle = lawOfCosinesAngle(a, b, c);

            return [
                upperShockAngle - shockUpperAngleWithLinkage,
                // 0,
                Math.PI - (lowerShockAngle + shockLowerAngleWithLinkageCompliment),
            ];
        };
    }, [ shockUpper, shockLower, lowerSuspension ]);

    const linkageSolve =  useMemo(() => {
        const a = upperSuspension.position.clone().sub(lowerSuspension.position).length();
        const b = upperSuspensionSocket.position.length();
        const c = 0.064; // From Wheel
        const d = wheelMountPoint.position.length();
        
        const initialAngle = Math.PI / 2;

        console.log(a, b, c, d, initialAngle);
        // const diagonal = rightLinkage5Obj.position.clone().sub(rightLinkage2Obj.position).length();
        
        const solve = createFourbarLinkageSolver(a, b, c, d);

        return (theta : number) => {
            const [ a, b, c, d ] = solve(-theta + initialAngle);
            return [
                theta,
                b - Math.PI/2,
                c,
                d - Math.PI/2,
            ]
        }
    }, [ upperSuspension, lowerSuspension, upperSuspensionSocket, wheelMountPoint ]);
    
    const linkages = linkageSolve(angle);
    
    lowerSuspension.setRotationFromAxisAngle(new Vector3(1, 0, 0), angle);
    upperSuspension.setRotationFromAxisAngle(new Vector3(1, 0, 0), linkages[1]);
    wheelMountPoint.setRotationFromAxisAngle(new Vector3(1, 0 , 0), -linkages[3]);

    const [ upperShockAngle, lowerShockAngle ] = shockSolve(angle);
    shockUpper.setRotationFromAxisAngle(new Vector3(1, 0, 0), Math.PI/2-upperShockAngle);
    shockLower.setRotationFromAxisAngle(new Vector3(1, 0, 0), -lowerShockAngle);
    
    return [
        suspension,
        wheelMountPoint
    ];
}

function useWheel(mountPoint: Object3D, offset : number, angle : number) {
    const wheelGltf = useLoader(GLTFLoader, "/models/Wheel-High-Quality.glb");
    
    const wheel = useMemo(() => {
        const wheel = wheelGltf.scene.children[0].clone(true);
        mountPoint.add(wheel);
        return wheel;
    }, [wheelGltf, mountPoint]);

    const steeringAxis = useThreeSubobject(wheel, "Steering_Axis");

    steeringAxis.setRotationFromAxisAngle(new Vector3(0, 1, 0), offset + angle);

    return [ wheel ];
}

export function RobotModel() {

    const { sus_angle } = useControls("Suspension", {
        sus_angle: {
            value: 45,
            min: 20,
            max: 60,
        },
    });

    const { fl, fr, b } = useControls("Drive", {
        fr: {
            value: 0,
            step: 1,
        },

        fl: {
            value: 0,
            step: 1,
        },

        b: {
            value: 0,
            step: 1,
        }
    });

    const { effectorPosition, elbow, rotunda, shoulder, wristPitch, wristRoll } = useControls("Arm", {
        effectorPosition: {
            value: 0,
            min: -15,
            max: 50
        },
        elbow: {
            value: 0,
            min: -30,
            max: 60,
        },
        rotunda: {
            value: 0,
            step: 1,
        },
        shoulder:  {
            value: 0,
            min: -30,
            max: 90,
        },
        wristPitch: {
            value: 0,
            min: -90,
            max: 90,
        },
        wristRoll: {
            value: 0,
            step: 1,
        }
    });

    const [
        chassi,
        suspensionMountPointFR,
        suspensionMountPointFL,
        suspensionMountPointB,
        rotundaMountPoint ] = useChassi();

    const [ suspensionFR, wheelMountPointFR ] = useSuspension(suspensionMountPointFR, sus_angle * DEG_TO_RAD);
    const [ suspensionB, wheelMountPointB ] = useSuspension(suspensionMountPointB, sus_angle * DEG_TO_RAD);
    const [ suspensionFL, wheelMountPointFL ] = useSuspension(suspensionMountPointFL, sus_angle * DEG_TO_RAD);
   
    const [ wheelFR ] = useWheel(wheelMountPointFR, -Math.PI/6, fr * DEG_TO_RAD);
    const [ wheelB ] = useWheel(wheelMountPointB,  Math.PI/2, b * DEG_TO_RAD);
    const [ wheelFL ] = useWheel(wheelMountPointFL, Math.PI/6, fl * DEG_TO_RAD);

    const [ arm ] = useArm(rotundaMountPoint, {
        effectorPosition: effectorPosition * DEG_TO_RAD,
        elbow: elbow * DEG_TO_RAD,
        rotunda: rotunda * DEG_TO_RAD,
        shoulder: shoulder * DEG_TO_RAD,
        wristPitch: wristPitch * DEG_TO_RAD,
        wristRoll: wristRoll * DEG_TO_RAD
    });

    return <primitive object={chassi}/>
}

function FollowingLight({ color, intensity, position } : { color?:ColorRepresentation, intensity?:number, position?:Vector3Tuple }) {
    const { scene, camera } = useThree();
    const lightRef = useRef(new DirectionalLight(color, intensity));

    if(intensity != null) { 
        lightRef.current.intensity = intensity;
    }
    if(color != null) {
        lightRef.current.color.set(color);
    }
    if(position != null) {
        lightRef.current.position.set(...position);
    }
    
    useEffect(() => {
        scene.add(camera);
        camera.add(lightRef.current);

        return () => {
            scene.remove(camera);
            // eslint-disable-next-line react-hooks/exhaustive-deps
            camera.remove(lightRef.current);
        }
    }, [camera, scene]); 

    return null;
}

export function DrivePlayground() {

    return <Canvas
            linear
            camera={{fov: 75, near: 0.001, far: 1000, position: [0, 0, 2]}}
            >
        <Suspense fallback={<Loader/>}>
            

            <Environment files="./env/industrial_sunset_puresky_2k.hdr" background={true} blur={0.5} />
            {/* <Environment files="./env/studio_small_08_1k.hdr"/> */}
            <FollowingLight color={0xffffff} intensity={10} position={[0, 0, 1]}/>
            <OrbitControls makeDefault/>
            <RobotModel/>
            <gridHelper/>
        </Suspense>
</Canvas>
}

