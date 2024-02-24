"use client"

import Image from 'next/image'
import styles from './page.module.css'
import { NavigationPanel } from '@/components/navigation-panel/navigation-panel'
import { useEffect, useMemo, useRef, useState } from 'react';
import { AngleRangeSlider, CustomRangeSlider } from '@/components/custom-range-slider/CustomRangeSlider';


const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = 1 / RAD_TO_DEG;


function toRad(degrees : number, minutes : number = 0, seconds : number = 0) {
  return (degrees + minutes / 60 + seconds / 3600) * DEG_TO_RAD;
}




export default function Home() {
  const [ heading, setHeading ] = useState(0);
  const [ long, setLong ] = useState(0);
  const [ lat, setLat ] = useState(0);

  useEffect(() => {

  });

  // useEffect(() => {
  //   window.addEventListener("mousemove", (e) => {
  //     setHeadingRef.current((heading : number) => ((heading + 20 *e.movementX / window.innerWidth) + 360) % 360);
  //   });

  //   setInterval
  // }, []);


  const lidar = useMemo(() => {
    const points = [];
    for(let i = 0; i < 360; i += 5) {
      const theta = i * DEG_TO_RAD;
      const r = 2 * Math.sin(theta) + 1;
      points.push({
        theta,
        r
      });
    }
    return points
  }, []);
  

  return (
    <main className={styles.main}>
      <div style={{width: "600px", height: "600px"}}>
        <NavigationPanel 
          heading={heading * DEG_TO_RAD} 
          location={{lat: lat * DEG_TO_RAD, long: long * DEG_TO_RAD}} 
          viewportSize={4} 
          headingSetpoint={23.4 * DEG_TO_RAD}
          waypoints={[
            { location: { lat: toRad(0, 0.00053959296 ), long: 0 }, label: "1m N 0m W" },
            // { location: { lat: -1, long: 0 } },
            // { location: { lat: 0, long: 1 } },
            { location: { lat: 0, long: toRad(0, 0.00053959296 ) }, label: "0m N 1m E" },
          ]}
          lidar={lidar}
          
          />
      </div>
      <div style={{width: "300px"}}>
        <AngleRangeSlider min={0} max={360} infinite={true} value={heading} onChange={(heading) => setHeading(heading)}/>
        <AngleRangeSlider tickScale={10000000} min={-90} max={90} value={lat} onChange={(lat) => setLat(lat)}/>
        <AngleRangeSlider tickScale={10000000} min={-180} max={180} value={long} onChange={(long) => setLong(long)}/> 
      </div>
    </main>
  )
}
