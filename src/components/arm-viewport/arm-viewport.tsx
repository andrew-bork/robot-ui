
"use client"
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Object3D, Vector3 } from "three";

import { Environment, OrbitControls, TransformControls } from '@react-three/drei'
import { ArmInverseKinematicsSolver, ArmInverseKinematicsSolverSettingsArgs } from "@/inverse-kinematics";
import { ArmState, EffectorState } from "@/robot-types";
import { useArm } from "@/models/arm";
import { FollowingLight, Loader, SelectableBackground } from "@/three-util";
import { useArmController, useChangeSubsystemController } from "../gamepad-context/gamepad-context";


const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = 1 / RAD_TO_DEG;

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

interface ArmCommandDTO {
    heartbeat_count: number;
    is_operational: number;
    speed: number;
    rotunda_angle: number;
    shoulder_angle: number;
    elbow_angle: number;
    wrist_pitch_angle: number;
    wrist_roll_angle: number;
    end_effector_angle: number;
}

export function armStringFormat(commands: ArmCommandDTO): string {
    return `{"heartbeat_count":${commands.heartbeat_count},"is_operational":${commands.is_operational},"speed":${commands.speed},"angles":[${commands.rotunda_angle},${commands.shoulder_angle},${commands.elbow_angle},${commands.wrist_pitch_angle},${commands.wrist_roll_angle},${commands.end_effector_angle}]}`;
};




function ArmInverseKinematicsController({ position, setPosition } : { position: Vector3, setPosition: (position:Vector3)=>void }) {
    const targetRef = useRef(new Object3D());
    targetRef.current.position.copy(position);
    
    return <>
        <primitive object={targetRef.current}/>
        <TransformControls object={targetRef.current} onChange={(e) => {
            setPosition(targetRef.current.position);
        }} />
    </>
}

export function ArmPlayground({ angles, setAngles, position, setPosition } : { position: Vector3, setPosition: (position:Vector3)=>void, angles: ArmState, setAngles : (newAngles : ArmState) => void }) {
    // const solverSettings = {
    //     shoulderAbsolutePosition: new Vector3(0, 0.088, 0.085),
    //     shoulderLength: 0.457,
    //     elbowLength: 0.457,
    //     wristLength: 0.2,
    //     maximumAngularSpeed: 2 * Math.PI,
    // };
    return <Canvas
            linear
            camera={{fov: 75, near: 0.1, far: 1000, position: [0, 0, 2]}}
            >
        <Suspense fallback={<Loader/>}>
            <SelectableBackground/>
            <FollowingLight color={0xffffff} intensity={1} position={[0, 0, 1]}/>
            <OrbitControls makeDefault/>
            <ArmModel {...angles}/>
            <ArmInverseKinematicsController position={position} setPosition={setPosition} />
            <gridHelper/>
        </Suspense>
</Canvas>
}

