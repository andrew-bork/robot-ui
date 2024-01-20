
"use client"
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Object3D, Vector3 } from "three";

import { Environment, OrbitControls, TransformControls } from '@react-three/drei'
import { ArmInverseKinematicsSolver } from "@/inverse-kinematics";
import { ArmState, EffectorState } from "@/robot-types";
import { useArm } from "@/models/arm";
import { FollowingLight, Loader, SelectableBackground } from "@/three-util";


export function ArmModel(armState : ArmState) {
    const origin = useMemo(() => new Object3D(), []);
    const [ arm ] = useArm(origin, armState);
    return <primitive object={arm}/>
}

export function ArmViewport(args : ArmState) {

    return <Canvas
            linear
            camera={{fov: 75, near: 0.1, far: 1000, position: [0, 0, 2]}}
            >
                <Suspense fallback={<Loader/>}>
                    <SelectableBackground/>
                    <FollowingLight color={0xffffff} intensity={10} position={[0, 0, 1]}/>
                    <OrbitControls makeDefault/>
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
            <SelectableBackground/>
            <FollowingLight color={0xffffff} intensity={1} position={[0, 0, 1]}/>
            <OrbitControls makeDefault/>
            <ArmModel {...angles}/>
            <ArmInverseKinematicsController setAngles={setAngles} effectorState={effectorState}/>
            <gridHelper/>
        </Suspense>
</Canvas>
}

