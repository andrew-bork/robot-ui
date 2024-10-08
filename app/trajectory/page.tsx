"use client"
import TrajectoryView from "@/components/trajectory-view/TrajectoryView"
import styles from "./page.module.css"
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { TimelineSlider } from "@/components/timeline-slider/TimelineSlider";
import { ResizeFollower } from "@/components/resize-follower/ResizeFollower";



function parametricFunction(t:number) {
    return { 
        x: 0.1*Math.cos(10*t), 
        y: t, 
        z: 0.1*Math.sin(10*t) 
    };
}
export default function Trajectory() {
    let data = useMemo(() => {
        const out = [];
        for(let i = 0; i <= 1.0; i +=0.01) {
            out.push({
                position: parametricFunction(i)
            });
        }
        return out;
    }, []);
    

    const [ current, setCurrent ] = useState(data.length-1);






    return <main className={styles.main}>
        
        <div className={styles["left-sidebar"]}>

        </div>

        
        <div className={styles["center-container"]}>
            <ResizeFollower className={styles["trajectory-container"]}>
                <TrajectoryView
                    data={data}
                    current={Math.floor(current)}
                    />
            </ResizeFollower>
            <div className={styles["timeline-container"]}>
                {/* <TimelineSlider
                 
                min={0} max={data.length-1} 
                tickScale={1} 
                tickAmount={5} 
                
                primaryTickPeriod={10} 
                secondaryTickPeriod={5} 
                toText={(a) => { return a.toFixed(0)}}
                value={current} 
                onChange={(value) => {setCurrent(value)}}
                /> */}

                <input type="range" value={current} min={0} max={99} step={1} onChange={(e) => setCurrent(parseInt(e.target.value))}/>
            </div>
        </div>

        <div className={styles["right-sidebar"]}>

        </div>

    </main>
}