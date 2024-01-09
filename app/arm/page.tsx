"use client"
import Image from 'next/image'
import styles from './page.module.css'
import { ArmViewport } from '@/components/arm-viewport/arm-viewport'
import { AngleRangeSlider } from '@/components/custom-range-slider/CustomRangeSlider'
import { useState } from 'react'

const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = 1 / RAD_TO_DEG;

export default function Arm() {

  const [ armBaseAngle, setArmBaseAngle ] = useState(0);
  const [ foreArmAngle, setForeArmAngle ] = useState(0);
  const [ hindArmAngle, setHindArmAngle ] = useState(0);
  const [ foreWristAngle, setForeWristAngle ] = useState(0);
  const [ hindWristAngle, setHindWristAngle ] = useState(0);

  return (
    <main className={styles["main"]}>
      
      <div className={styles["drive-control-panel"]}>
        <h1>Arm</h1>
        <h4 style={{marginTop: "24px"}}>Rotunda</h4>
        <AngleRangeSlider infinite={true} value={armBaseAngle} onChange={setArmBaseAngle}/>
        <h4 style={{marginTop: "24px"}}>Shoulder</h4>
        <AngleRangeSlider min={0} max={90} value={hindArmAngle} onChange={setHindArmAngle}/>
        <h4 style={{marginTop: "24px"}}>Elbow</h4>
        <AngleRangeSlider min={-30} max={60} value={foreArmAngle} onChange={setForeArmAngle}/>
        <h4 style={{marginTop: "24px"}}>Wrist Pitch</h4>
        <AngleRangeSlider min={-90} max={90} value={hindWristAngle} onChange={setHindWristAngle}/>
        <h4 style={{marginTop: "24px"}}>Wrist Roll</h4>
        <AngleRangeSlider infinite={true} value={foreWristAngle} onChange={setForeWristAngle}/>
      </div>
      <div style={{maxWidth: "100%", height: "100%", position: "relative", overflow: "hidden"}}>

        <ArmViewport 
          armBaseAngle={armBaseAngle * DEG_TO_RAD}
          hindArmAngle={hindArmAngle * DEG_TO_RAD}
          foreArmAngle={foreArmAngle * DEG_TO_RAD}
          hindWristAngle={hindWristAngle * DEG_TO_RAD}
          foreWristAngle={foreWristAngle * DEG_TO_RAD}
          />
      </div>

    </main>
  )
}
