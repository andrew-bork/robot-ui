"use client"
import Image from 'next/image'
import styles from './page.module.css'
import { ArmPlayground, ArmViewport, armStringFormat } from '@/components/arm-viewport/arm-viewport'
import { AngleRangeSlider } from '@/components/custom-range-slider/CustomRangeSlider'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArmState, EffectorState } from '@/robot-types'
import { useArmController, useChangeSubsystemController } from '@/components/gamepad-context/gamepad-context'
import { Vector3 } from 'three'
import { ArmInverseKinematicsSolver } from '@/inverse-kinematics'

const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = 1 / RAD_TO_DEG;

const sensitivities = [1, 0.5, 0.1, 0.01];

function useAnimation(callback : (dt : number) => void) {
  const callbackRef = useRef(callback);
  const animationFrameRef = useRef(-1);
  callbackRef.current = callback;
  useEffect(() => {
      let then = 0;
      const update = (now : number) => {
          const dt = (now - then) * 0.001;
          then = now;
          callbackRef.current(dt);
          animationFrameRef.current = requestAnimationFrame(update);
      }
      animationFrameRef.current = requestAnimationFrame(update);

      return () => {
          cancelAnimationFrame(animationFrameRef.current);
      }
  }, []);
}


export default function Arm() {
  const [ angles, setAngles ] = useState<ArmState>({
    rotunda: 0, // Rotunda
    shoulder: 0, // Shoulder
    elbow: 0, // Elbow
    wristPitch: 0, // Wrist Pitch
    wristRoll: 0, // Wrist Roll
    effectorPosition: 0,
  });

  const [ effectorState, setEffectorState ] = useState<EffectorState>({ pitch: 0, roll: 0, position: 0 });
  const [ currentSensitivity, setCurrentSensitivity ] = useState(0);
  const [ position, setPositionState ] = useState(new Vector3(0, 0.2341999999284742, 0.41340000009536737));


  const armController = useArmController();
  const changeSubsystemController = useChangeSubsystemController();

  const alreadyPressed = useRef<boolean[]>([]);
  const effectorOpened = useRef(false);
  const solverSettings = useMemo(() => ({
    shoulderAbsolutePosition: new Vector3(0, 0.088, 0.085),
    shoulderLength: 0.457,
    elbowLength: 0.457,
    wristLength: 0.2,
    maximumSpeed: 0.005,
}), []);
  const armInverseKinematicsSolverRef = useRef(new ArmInverseKinematicsSolver(solverSettings));
    useEffect(() => {
        armInverseKinematicsSolverRef.current.settings = {...armInverseKinematicsSolverRef.current.settings, ...solverSettings}
    }, [ solverSettings ]);

    useEffect(() => {
        armInverseKinematicsSolverRef.current.goto(position);
    }, []);


  const setPosition = (position: Vector3) => {
    const outOfBounds = armInverseKinematicsSolverRef.current.checkBounds(position, effectorState.pitch, effectorState.roll);
    if(!outOfBounds) {
      setPositionState(position);
    }else {
      if(armController == -1) return;
      const gamepad = navigator.getGamepads().find((gamepad) => gamepad?.index === armController) as Gamepad;
      gamepad.vibrationActuator?.playEffect("dual-rumble", {
        startDelay: 0,
        duration: 200,
        weakMagnitude: 0.5,
        strongMagnitude: 1.0,
      });
    }
  }
  // const alreadPressed2 = useRef(false);

  const anglesRef = useRef(angles);
  anglesRef.current = angles;
  useAnimation((dt) => {
    const newController = navigator.getGamepads().find((gamepad) => gamepad?.buttons[9].pressed) as Gamepad
    if(newController){
        changeSubsystemController((controllers) => {
            return {...controllers, arm: newController.index}
        });   
    }
    const angles = armInverseKinematicsSolverRef.current.solve(position.clone(), effectorState.pitch, effectorState.roll, effectorState.position, dt);
    
    setAngles(angles);



      if(armController == -1) return;
      const gamepad = navigator.getGamepads().find((gamepad) => gamepad?.index === armController) as Gamepad;
      if(alreadyPressed.current.length != gamepad.buttons.length) alreadyPressed.current = gamepad.buttons.map((button) => button.pressed);

      // if(angles.outOfBounds) {
      //   gamepad.vibrationActuator?.playEffect("dual-rumble", {
      //     startDelay: 0,
      //     duration: 20,
      //     weakMagnitude: 1.0,
      //     strongMagnitude: 1.0,
      //   });
      // }
      // const positionChange = new Vector3(-(gamepad.buttons[15].value - gamepad.buttons[14].value) * dt, (gamepad.buttons[12].value - gamepad.buttons[13].value) * dt, 0)
      // targetRef.current.position.add(positionChange);

      if(gamepad.buttons[2].pressed && !alreadyPressed.current[2]) {
        if(effectorOpened.current) {
          effectorOpened.current = false;
          setEffectorState((state) => ({...state, position: 100}));
        }else {
          effectorOpened.current = true;
          setEffectorState((state) => ({...state, position: 0}));
        }
    }
      if(gamepad.buttons[4].pressed && !alreadyPressed.current[4]) {
        setCurrentSensitivity((i) => Math.max(i - 1, 0));
      }
      if(gamepad.buttons[5].pressed && !alreadyPressed.current[5]) {
        setCurrentSensitivity((i) => Math.min(i + 1, sensitivities.length - 1));
      }
      // if(gamepad.buttons[3].pressed && !alreadyPressed.current[3]) {
      //   gamepad.vibrationActuator?.playEffect("dual-rumble", {
      //     startDelay: 0,
      //     duration: 200,
      //     weakMagnitude: 0.5,
      //     strongMagnitude: 1.0,
      //   });
      // }



      alreadyPressed.current = gamepad.buttons.map((button) => button.pressed);
      const sensitivity = sensitivities[currentSensitivity];
      const forwardBackwardChange = sensitivity * (gamepad.buttons[6].value - gamepad.buttons[7].value) * dt;
      const leftRightChange = sensitivity * -(gamepad.buttons[15].value - gamepad.buttons[14].value) * dt;
      const upDownChange = sensitivity * (gamepad.buttons[12].value - gamepad.buttons[13].value) * dt;

      const positionChange = new Vector3(leftRightChange, upDownChange, forwardBackwardChange)
      let newPosition = position.clone();
      newPosition.add(positionChange);

      if(gamepad.buttons[0].pressed) {
        newPosition.set(0, 0.2341999999284742, 0.4134000000953673);
      }else if(gamepad.buttons[1].pressed) {
        newPosition.set(0, 0.5486000000238409, 0.7332000001668927);
      }
      setPosition(newPosition);

      setEffectorState((state) => {
        let roll = state.roll;
        let pitch = state.pitch;
        let position = state.position;

        roll += 90 * DEG_TO_RAD * ((gamepad.axes[2])) * dt;
        pitch += 90 * DEG_TO_RAD * (gamepad.axes[3]) * dt;

        if(gamepad.buttons[0].pressed) {
          roll = pitch = 0;
            // targetRef.current.position.set(0, 0.2341999999284742, 0.4134000000953673);
        }else if(gamepad.buttons[1].pressed) {
          roll = pitch = 0;
            // targetRef.current.position.set(0, 0.5486000000238409, 0.7332000001668927);
        }

        if(roll >  Math.PI) roll -= 2 * Math.PI;
        else if(roll < -Math.PI) roll += 2 * Math.PI;
        pitch = Math.max(Math.min(pitch, Math.PI/2), -Math.PI/2)
        // console.log("boop", position);
        return {
          roll: roll,
          position: position,
          pitch: pitch,
        }
      });
  });


  useEffect(() => {
    const PRECISION_MULTIPLIER = 1000;
    let request : Promise<any> | null = null;
    const interval = setInterval(() => {
        // console.log(anglesRef.current);
        if(request == null) {
            request = fetch("http://192.168.0.211:5000/arm", {
                method: "post",
                body: armStringFormat({
                    elbow_angle: Math.floor(anglesRef.current.elbow * RAD_TO_DEG * PRECISION_MULTIPLIER),
                    heartbeat_count: 0,
                    is_operational: 1,
                    rotunda_angle: Math.floor(anglesRef.current.rotunda * RAD_TO_DEG * PRECISION_MULTIPLIER),
                    shoulder_angle: Math.floor(anglesRef.current.shoulder * RAD_TO_DEG * PRECISION_MULTIPLIER),
                    end_effector_angle: Math.floor((anglesRef.current.effectorPosition)),
                    speed: 1,
                    wrist_pitch_angle: Math.floor(anglesRef.current.wristPitch * RAD_TO_DEG * PRECISION_MULTIPLIER),
                    wrist_roll_angle: Math.floor(anglesRef.current.wristRoll * RAD_TO_DEG * PRECISION_MULTIPLIER),
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

  return (
    <main className={styles["main"]}>
      
      <div className={styles["drive-control-panel"]}>
        <h1>Arm</h1>
        <h4 style={{marginTop: "24px"}}>Rotunda</h4>
        {/* <AngleRangeSlider infinite={true} value={angles.rotunda * RAD_TO_DEG} onChange={()=>{}}/> */}
        <h4 style={{marginTop: "24px"}}>Shoulder</h4>
        {/* <AngleRangeSlider min={-30} max={90} value={angles.elbow * RAD_TO_DEG} onChange={()=>{}}/> */}
        <h4 style={{marginTop: "24px"}}>Elbow</h4>
        {/* <AngleRangeSlider min={-30} max={60} value={angles.shoulder * RAD_TO_DEG} onChange={()=>{}}/> */}
        <h4 style={{marginTop: "24px"}}>Wrist Pitch</h4>
        {/* <AngleRangeSlider min={-90} max={90} value={angles.wristPitch * RAD_TO_DEG} onChange={()=>{}}/> */}
        <h4 style={{marginTop: "24px"}}>Effector Position</h4>
        <AngleRangeSlider min={0} max={100} tickAmount={10} tickScale={1} value={effectorState.position} onChange={(a) => { setEffectorState({...effectorState, position: a}); }}/>
        <h4 style={{marginTop: "24px"}}>Effector Pitch</h4>
        <AngleRangeSlider min={-90} max={90} value={effectorState.pitch  *RAD_TO_DEG} onChange={(a) => { setEffectorState({...effectorState, pitch: a * DEG_TO_RAD}); }}/>
        <h4 style={{marginTop: "24px"}}>Effector Roll</h4>
        <AngleRangeSlider infinite={true} value={effectorState.roll * RAD_TO_DEG} onChange={(a) => { setEffectorState({...effectorState, roll: a * DEG_TO_RAD}); }}/>
        <h4 style={{marginTop: "24px"}}>Sensitivity</h4>
        <p>±{sensitivities[currentSensitivity]} m/s</p>
      </div>
      <div style={{maxWidth: "100%", height: "100%", position: "relative", overflow: "hidden"}}>

        {/* <ArmViewport 
          RotundaAngle={RotundaAngle * DEG_TO_RAD}
          ShoulderAngle={ShoulderAngle * DEG_TO_RAD}
          ElbowAngle={ElbowAngle * DEG_TO_RAD}
          WristPitchAngle={WristPitchAngle * DEG_TO_RAD}
          WristRollAngle={WristRollAngle * DEG_TO_RAD}
          /> */}

        <ArmPlayground angles={angles} setAngles={setAngles} position={position} setPosition={setPosition}/>
      </div>

    </main>
  )
}
