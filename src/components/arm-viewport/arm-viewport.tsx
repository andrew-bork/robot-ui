
"use client"
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { DirectionalLight, Object3D, Vector3, ColorRepresentation, Vector3Tuple } from "three";
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { TransformControls } from "three/examples/jsm/Addons.js";

import { Environment, Html, OrbitControls, TransformControls, useProgress } from '@react-three/drei'
import { ArmInverseKinematicsSolver, createFourbarLinkageSolver } from "@/inverse-kinematics";


function Loader() {
    const { progress } = useProgress()
    return <Html center>{progress} % loaded</Html>
}
  
export interface ArmState {
    rotunda : number; // Rotunda
    shoulder : number; // Shoulder
    elbow : number; // Elbow
    wristPitch : number; // Wrist Pitch
    wristRoll : number; // Wrist Roll
    effectorPosition: number;
};

export interface EffectorState {
    pitch: number;
    roll: number;
    position: number;
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

export function ArmModel({ rotunda, elbow, shoulder, wristRoll, wristPitch, effectorPosition } : ArmState) {
    const gltf = useLoader(GLTFLoader, "/models/Arm-High-Quality.glb");
    const scene = useMemo(() => gltf.scene.clone(), [gltf]);

    const rotundaObj = useMemo(() => findThreeSubobject(scene, "Arm") ?? new Object3D(), [scene]);
    const shoulderObj = useMemo(() => findThreeSubobject(rotundaObj, "Shoulder") ?? new Object3D(), [rotundaObj]);
    const elbowObj = useMemo(() => findThreeSubobject(shoulderObj, "Elbow") ?? new Object3D(), [shoulderObj]);
    const wristPitchObj = useMemo(() => findThreeSubobject(elbowObj, "Wrist_Pitch") ?? new Object3D(), [elbowObj]);
    const wristRollObj = useMemo(() => findThreeSubobject(wristPitchObj, "Wrist_Roll") ?? new Object3D(), [wristPitchObj]);

    const rightLinkage1Obj = useMemo(() => findThreeSubobject(wristRollObj, "Right_Linkage_1") ?? new Object3D(), [wristRollObj]);
    const rightLinkage2Obj = useMemo(() => findThreeSubobject(rightLinkage1Obj, "Right_Linkage_2") ?? new Object3D(), [rightLinkage1Obj]);
    const rightLinkage3Obj = useMemo(() => findThreeSubobject(rightLinkage2Obj, "Right_Linkage_3") ?? new Object3D(), [rightLinkage2Obj]);
    const rightLinkage4Obj = useMemo(() => findThreeSubobject(rightLinkage3Obj, "Right_Linkage_4") ?? new Object3D(), [rightLinkage3Obj]);
    const rightLinkage5Obj = useMemo(() => findThreeSubobject(rightLinkage4Obj, "Right_Linkage_5") ?? new Object3D(), [rightLinkage4Obj]);

    const leftLinkage1Obj = useMemo(() => findThreeSubobject(wristRollObj, "Left_Linkage_1") ?? new Object3D(), [wristRollObj]);
    const leftLinkage2Obj = useMemo(() => findThreeSubobject(leftLinkage1Obj, "Left_Linkage_2") ?? new Object3D(), [leftLinkage1Obj]);
    const leftLinkage3Obj = useMemo(() => findThreeSubobject(leftLinkage2Obj, "Left_Linkage_3") ?? new Object3D(), [leftLinkage2Obj]);
    const leftLinkage4Obj = useMemo(() => findThreeSubobject(leftLinkage3Obj, "Left_Linkage_4") ?? new Object3D(), [leftLinkage3Obj]);
    const leftLinkage5Obj = useMemo(() => findThreeSubobject(leftLinkage4Obj, "Left_Linkage_5") ?? new Object3D(), [leftLinkage4Obj]);

    const fourBarSolver = useMemo(() => {
        const d = rightLinkage2Obj.position.length();
        const a = rightLinkage3Obj.position.length();
        const b = rightLinkage4Obj.position.length();
        const c = rightLinkage5Obj.position.length();

        const initialAngle = rightLinkage2Obj.position.clone().multiplyScalar(-1).angleTo(rightLinkage3Obj.position);
        console.log(a, b, c, d, initialAngle);
        // const diagonal = rightLinkage5Obj.position.clone().sub(rightLinkage2Obj.position).length();
        
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

    return <primitive object={rotundaObj}/>
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

export function ArmViewport(args : ArmState) {

    return <Canvas
            linear
            camera={{fov: 75, near: 0.1, far: 1000, position: [0, 0, 2]}}
            >
                <Suspense fallback={<Loader/>}>
                    <FollowingLight color={0xffffff} intensity={10} position={[0, 0, 1]}/>
                    <OrbitControls makeDefault/>
                    <ambientLight intensity={0.1} />
                    <ArmModel {...args}/>
                </Suspense>
    </Canvas>
}





function ArmInverseKinematicsController({ setAngles, effectorState } : { setAngles : (newAngles : ArmState) => void, effectorState: EffectorState}) {
    


    const armInverseKinematicsSolverRef = useRef(new ArmInverseKinematicsSolver({
        shoulderAbsolutePosition: new Vector3(0, 0.088, 0.085),
        shoulderLength: 0.457,
        elbowLength: 0.457,
        wristLength: 0.2,
        maximumAngularSpeed: 2 * Math.PI,
    }));
    const targetRef = useRef(new Object3D());

    useEffect(() => {
        targetRef.current.position.set(0,0.5, 0.5);
    }, [])

    useFrame((state, dt) => {
        const angles = armInverseKinematicsSolverRef.current.solve(targetRef.current.position.clone(), effectorState.pitch, effectorState.roll, effectorState.position, dt);
        setAngles(angles);
    });

    
    return <>
        <primitive object={targetRef.current}/>
        <TransformControls object={targetRef.current} />
    </>
}

export function ArmPlayground({ angles, setAngles, effectorState } : { angles: ArmState, setAngles : (newAngles : ArmState) => void, effectorState: EffectorState}) {

    return <Canvas
            linear
            camera={{fov: 75, near: 0.1, far: 1000, position: [0, 0, 2]}}
            >
        <Suspense fallback={<Loader/>}>
            

            <Environment files="./env/industrial_sunset_puresky_8k.hdr" background={true} />
            {/* <Environment files="./env/studio_small_08_1k.hdr" /> */}
            {/* <FollowingLight color={0xffffff} intensity={1} position={[0, 0, 1]}/> */}
            <OrbitControls makeDefault/>
            <ArmModel {...angles}/>
            <ArmInverseKinematicsController setAngles={setAngles} effectorState={effectorState}/>
            <gridHelper/>
        </Suspense>
</Canvas>
}

