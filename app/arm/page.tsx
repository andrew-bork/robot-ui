"use client"
import Image from 'next/image'
import styles from './page.module.css'
import { ArmPlayground, ArmViewport } from '@/components/arm-viewport/arm-viewport'
import { AngleRangeSlider } from '@/components/custom-range-slider/CustomRangeSlider'
import { useState } from 'react'
import { ArmState, EffectorState } from '@/robot-types'

const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = 1 / RAD_TO_DEG;

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
        <AngleRangeSlider min={-24} max={90} tickAmount={1} tickScale={5} value={effectorState.position * RAD_TO_DEG} onChange={(a) => { setEffectorState({...effectorState, position: a * DEG_TO_RAD}); }}/>
        <h4 style={{marginTop: "24px"}}>Effector Pitch</h4>
        <AngleRangeSlider min={-90} max={90} value={effectorState.pitch  *RAD_TO_DEG} onChange={(a) => { setEffectorState({...effectorState, pitch: a * DEG_TO_RAD}); }}/>
        <h4 style={{marginTop: "24px"}}>Effector Roll</h4>
        <AngleRangeSlider infinite={true} value={effectorState.roll * RAD_TO_DEG} onChange={(a) => { setEffectorState({...effectorState, roll: a * DEG_TO_RAD}); }}/>
      </div>
      <div style={{maxWidth: "100%", height: "100%", position: "relative", overflow: "hidden"}}>

        {/* <ArmViewport 
          RotundaAngle={RotundaAngle * DEG_TO_RAD}
          ShoulderAngle={ShoulderAngle * DEG_TO_RAD}
          ElbowAngle={ElbowAngle * DEG_TO_RAD}
          WristPitchAngle={WristPitchAngle * DEG_TO_RAD}
          WristRollAngle={WristRollAngle * DEG_TO_RAD}
          /> */}

        <ArmPlayground angles={angles} setAngles={setAngles} effectorState={effectorState} />
      </div>

    </main>
  )
}
