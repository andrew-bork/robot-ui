
"use client"
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Object3D, Vector3 } from "three";

import { Environment, OrbitControls, TransformControls } from '@react-three/drei'
import { ArmInverseKinematicsSolver } from "@/inverse-kinematics";
import { ArmState, EffectorState } from "@/robot-types";
import { useArm } from "@/models/arm";
import { FollowingLight, Loader, SelectableBackground } from "@/three-util";


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




function ArmInverseKinematicsController({ setAngles, effectorState } : { setAngles : (newAngles : ArmState) => void, effectorState: EffectorState}) {
    const armInverseKinematicsSolverRef = useRef(new ArmInverseKinematicsSolver({
        shoulderAbsolutePosition: new Vector3(0, 0.088, 0.085),
        shoulderLength: 0.457,
        elbowLength: 0.457,
        wristLength: 0.2,
        maximumAngularSpeed: 2 * Math.PI,
    }));
    const targetRef = useRef(new Object3D());
    const anglesRef = useRef<ArmState>({
        effectorPosition: 0,
        elbow: 0,
        rotunda: 0,
        shoulder: 0,
        wristPitch: 0,
        wristRoll: 0,
    });

    useEffect(() => {
        let request : Promise<any> | null = null;
        const interval = setInterval(() => {
            // console.log(anglesRef.current);
            if(request == null) {
                request = fetch("http://192.168.0.211:5000/arm", {
                    method: "post",
                    body: armStringFormat({
                        elbow_angle: Math.floor(anglesRef.current.elbow * RAD_TO_DEG),
                        heartbeat_count: 0,
                        is_operational: 1,
                        rotunda_angle: Math.floor(anglesRef.current.rotunda * RAD_TO_DEG),
                        shoulder_angle: Math.floor(anglesRef.current.shoulder * RAD_TO_DEG),
                        end_effector_angle: Math.floor(anglesRef.current.effectorPosition * RAD_TO_DEG),
                        speed: 1,
                        wrist_pitch_angle: Math.floor(anglesRef.current.wristPitch * RAD_TO_DEG),
                        wrist_roll_angle: Math.floor(anglesRef.current.wristRoll * RAD_TO_DEG),
                    }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then((e) => {
                    console.log("Request Success!");
                }).catch((e) => {
                    console.log("Request Failed!");
                }).finally(() => {
                    request = null;
                });
            }
        }, 10);

        return () => {
            clearInterval(interval);
        }
    }, []);

    useEffect(() => {
        targetRef.current.position.set(0,0.5, 0.5);
    }, [])

    useFrame((state, dt) => {
        const angles = armInverseKinematicsSolverRef.current.solve(targetRef.current.position.clone(), effectorState.pitch, effectorState.roll, effectorState.position, dt);
        anglesRef.current = angles;
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

