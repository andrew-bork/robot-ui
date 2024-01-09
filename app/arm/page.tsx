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
    <main className={styles.main}>
      <div style={{width: "800px", height: "500px"}}>

        <ArmViewport 
          armBaseAngle={armBaseAngle * DEG_TO_RAD}
          hindArmAngle={hindArmAngle * DEG_TO_RAD}
          foreArmAngle={foreArmAngle * DEG_TO_RAD}
          hindWristAngle={hindWristAngle * DEG_TO_RAD}
          foreWristAngle={foreWristAngle * DEG_TO_RAD}
          />
      </div>

      <div style={{width: "300px"}}>
        <AngleRangeSlider infinite={true} value={armBaseAngle} onChange={setArmBaseAngle}/>
        <AngleRangeSlider min={0} max={90} value={hindArmAngle} onChange={setHindArmAngle}/>
        <AngleRangeSlider value={foreArmAngle} onChange={setForeArmAngle}/>
        <AngleRangeSlider min={-90} max={90} value={hindWristAngle} onChange={setHindWristAngle}/>
        <AngleRangeSlider infinite={true} value={foreWristAngle} onChange={setForeWristAngle}/>
      </div>
    </main>
  )
}
