import { useArm } from "@/models/arm";
import { useChassi, useSuspension, useWheel } from "@/models/robot";
import { FollowingLight, Loader, SelectableBackground } from "@/three-util";
import { Environment, Html, OrbitControls, TransformControls, useProgress } from "@react-three/drei";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AxesHelper, ColorRepresentation, DirectionalLight, Object3D, Vector3, Vector3Tuple } from "three";



const DEG_TO_RAD = Math.PI / 180;


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
   
    const [ wheelFR ] = useWheel(wheelMountPointFR, -Math.PI/6 - Math.PI/2, fr * DEG_TO_RAD);
    const [ wheelB ] = useWheel(wheelMountPointB,  0, b * DEG_TO_RAD);
    const [ wheelFL ] = useWheel(wheelMountPointFL, Math.PI/6 + Math.PI/2, fl * DEG_TO_RAD);

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


function DraggableBox() {
    const [ targeted, setTargeted ] = useState<Object3D|null>(null);

    // const [ object ]

    return <>
        <mesh 
            onClick={(e) => setTargeted(e.object)} 
            onPointerMissed={() => setTargeted(null)}
            // onPointerOver={() => setHovered(true)} 
            // onPointerOut={() => setHovered(false)}
            scale={[0.03,0.03,0.03]}
        >
        <boxGeometry/>
        <meshNormalMaterial/>
        </mesh>
        {targeted ? <TransformControls object={targeted}/> : <></>}
    </>
}

export function DrivePlayground() {

    return <Canvas
            linear
            camera={{fov: 75, near: 0.001, far: 1000, position: [0, 0, 2]}}
            >
        <Suspense fallback={<Loader/>}>
            <SelectableBackground/>
            
            <FollowingLight color={0xffffff} intensity={1} position={[0, 0, 1]}/>
            <OrbitControls makeDefault/>
            <RobotModel/>
            <gridHelper/>
            <DraggableBox/>
        </Suspense>
</Canvas>
}

