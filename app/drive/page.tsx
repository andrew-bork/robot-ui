"use client"
import Image from 'next/image'
import styles from './page.module.css'
import { useEffect, useRef, useState } from 'react'
import { Vector, Vector2D } from '@/vector'


interface Size {
    width: number,
    height: number
}



function calculateWheelAngles(wheelLocations : Vector2D[], turningCircleCenter : Vector2D) {
    const directions = [
        Vector.sub(wheelLocations[0], turningCircleCenter),
        Vector.sub(wheelLocations[1], turningCircleCenter),
        Vector.sub(wheelLocations[2], turningCircleCenter),
    ]

    const angles = [
        Vector.angle(directions[0]), 
        Vector.angle(directions[1]), 
        Vector.angle(directions[2])
    ];
    if(angles[0] < 0) angles[0] += Math.PI / 2;
    else angles[0] -= Math.PI / 2;
    if(angles[1] < 0) angles[1] += Math.PI / 2;
    else angles[1] -= Math.PI / 2;
    if(angles[2] < 0) angles[2] += Math.PI / 2;
    else angles[2] -= Math.PI / 2;
    return angles;
}

export default function Drive() {

    const [ ctx, setCtx] = useState<CanvasRenderingContext2D|null>(null);
    const [ size, setSize ] = useState<Size>({ width: 200, height: 200 });

    const [ steeringAngle, setSteeringAngle ] = useState(0);
    const [ speed, setSpeed ] = useState(0);

    const canvas = useRef<HTMLCanvasElement|null>(null);
    const div = useRef<HTMLDivElement|null>(null);

    if(canvas.current != null) {
        canvas.current.width = size.width;
        canvas.current.height = size.height;
    }



    const wheelLocations = [
        { x: 0, y: -1},
        { x: Math.sqrt(3) / 2, y: 0.5 },
        { x: -Math.sqrt(3) / 2, y: 0.5 },    
    ];
    const turningCircleCenter = { x: 1 / Math.tan(steeringAngle), y: 0 };
    const turningRadius = Vector.mag(turningCircleCenter);

    const wheelAngles = calculateWheelAngles(wheelLocations, turningCircleCenter);
    const map = (point : Vector2D) : Vector2D => {
        return {
            x: 200 * point.x + size.width/2,
            y: -200 * point.y + size.height/2,
        }
    }

    let wheel0TextLocation = Vector.add(map(wheelLocations[0]), { x: 60, y: 60});
    let wheel1TextLocation = Vector.add(map(wheelLocations[1]), { x: 60, y: -60});
    let wheel2TextLocation = Vector.add(map(wheelLocations[2]), { x: -250, y: -60});

    if(ctx != null) {

        requestAnimationFrame(() => {
            ctx.clearRect(0, 0, size.width, size.height);

            ctx.strokeStyle = "#bbbbbb";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(size.width/2, size.height/2, 5, 5, 0, 0, 2 * Math.PI);
            ctx.stroke();



            wheelLocations.forEach((location) => {
                const mapped = map(location);
                ctx.beginPath();
                ctx.ellipse(mapped.x, mapped.y, 5, 5, 0, 0, 2 * Math.PI);
                ctx.stroke();
            });

            ctx.beginPath();
            const turningCircleCenterMapped = map(turningCircleCenter);
            ctx.moveTo(turningCircleCenterMapped.x, turningCircleCenterMapped.y - 5);
            ctx.lineTo(turningCircleCenterMapped.x + Math.sqrt(3) * 2.5, turningCircleCenterMapped.y + 2.5);
            ctx.lineTo(turningCircleCenterMapped.x - Math.sqrt(3) * 2.5, turningCircleCenterMapped.y + 2.5);
            ctx.lineTo(turningCircleCenterMapped.x, turningCircleCenterMapped.y - 5);
            ctx.stroke();

            
            wheelLocations.forEach((point, i) => {
                ctx.beginPath();
                const direction = { x: 20 * Math.sin(wheelAngles[i]), y: 20* Math.cos(wheelAngles[i])}
                const mid = map(point);
                const start = { x: mid.x + direction.x, y: mid.y - direction.y };
                const end = { x: mid.x - direction.x, y: mid.y + direction.y};
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            });

            ctx.strokeStyle = "#333333";
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(0, size.height / 2);
            ctx.lineTo(size.width, size.height/2);
            ctx.stroke();

            {
                const arcLength = 100;
                if(isFinite(turningRadius)){
                    const angleRange = Math.min(arcLength / (turningRadius * 200), Math.PI);
                    const angle = Vector.angle(turningCircleCenter) + Math.PI / 2;
                    if(angle - Math.PI/2 < 0) {
                        ctx.setLineDash([5, 5]);
                        ctx.beginPath();
                        ctx.arc(turningCircleCenterMapped.x, turningCircleCenterMapped.y, turningRadius * 200, angle, angle + angleRange);
                        ctx.stroke();
                        
                        ctx.strokeStyle = "#bbbbbb";
                        ctx.setLineDash([]);
                        ctx.beginPath();
                        ctx.arc(turningCircleCenterMapped.x, turningCircleCenterMapped.y, turningRadius * 200, angle-angleRange, angle);
                        ctx.stroke();

                    }else {
                        ctx.setLineDash([5, 5]);
                        ctx.beginPath();
                        ctx.arc(turningCircleCenterMapped.x, turningCircleCenterMapped.y, turningRadius * 200, angle-angleRange, angle);
                        ctx.stroke();
        
                        ctx.strokeStyle = "#bbbbbb";
                        ctx.setLineDash([]);
                        ctx.beginPath();
                        ctx.arc(turningCircleCenterMapped.x, turningCircleCenterMapped.y, turningRadius * 200, angle, angle + angleRange);
                        ctx.stroke();

                    }
                }else {
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.moveTo(size.width/2, size.height/2);
                    ctx.lineTo(size.width/2, size.height/2 + arcLength);
                    ctx.stroke();
    
                    ctx.strokeStyle = "#bbbbbb";
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.moveTo(size.width/2, size.height/2);
                    ctx.lineTo(size.width/2, size.height/2 - arcLength);
                    ctx.stroke();

                }
            }
            

            ctx.strokeStyle = "#bbbbbb";
            const wheelLocation0Mapped = map(wheelLocations[0]);
            ctx.beginPath();
            ctx.moveTo(wheelLocation0Mapped.x + 30, wheelLocation0Mapped.y + 30);
            ctx.lineTo(wheelLocation0Mapped.x + 60, wheelLocation0Mapped.y + 60);
            ctx.lineTo(wheelLocation0Mapped.x + 250, wheelLocation0Mapped.y + 60);
            ctx.stroke();

            const wheelLocation1Mapped = map(wheelLocations[1]);
            ctx.beginPath();
            ctx.moveTo(wheelLocation1Mapped.x + 30, wheelLocation1Mapped.y - 30);
            ctx.lineTo(wheelLocation1Mapped.x + 60, wheelLocation1Mapped.y - 60);
            ctx.lineTo(wheelLocation1Mapped.x + 250, wheelLocation1Mapped.y - 60);
            ctx.stroke();

            const wheelLocation2Mapped = map(wheelLocations[2]);
            ctx.beginPath();
            ctx.moveTo(wheelLocation2Mapped.x - 30, wheelLocation2Mapped.y - 30);
            ctx.lineTo(wheelLocation2Mapped.x - 60, wheelLocation2Mapped.y - 60);
            ctx.lineTo(wheelLocation2Mapped.x - 250, wheelLocation2Mapped.y - 60);
            ctx.stroke();

        });
    }

    useEffect(() => {
        // console.log(canvas, div);
        if(canvas.current != null && div.current != null ) {
            (new ResizeObserver(() => {
                setSize({
                    width: div.current?.clientWidth ?? 0,
                    height: div.current?.clientHeight ?? 0,
                });
            })).observe(div.current);

            setCtx(canvas.current.getContext("2d"));
        }
    }, [])

    return (
        <main className={styles["main"]}>
            <div className={styles["drive-control-panel"]}>
                <h2>Drive Control</h2>
                <label>Speed:</label>
                <input type="range"/>
                <label>Steering angle:</label>
                <span>-90</span>
                <input type="range" min={-90} max={90} step={0.01} value={steeringAngle * 180 / Math.PI} onChange={(e) => {setSteeringAngle(parseFloat(e.target.value) * Math.PI / 180)}}/>
                <span>90</span>

            </div>
            <div ref={div} style={{maxWidth: "100%", height: "100%", position: "relative"}}>
                <canvas ref={canvas} style={{ position: "absolute" }}></canvas>
                <div style={{ position: "absolute", left: wheel0TextLocation.x + "px", top: wheel0TextLocation.y + "px" }}>
                    {(wheelAngles[0] * 180 / Math.PI).toFixed(1)}°
                </div>
                <div style={{ position: "absolute", left: wheel1TextLocation.x + "px", top: wheel1TextLocation.y + "px" }}>
                    {(wheelAngles[1] * 180 / Math.PI).toFixed(1)}°
                </div>
                <div style={{ position: "absolute", left: wheel2TextLocation.x + "px", top: wheel2TextLocation.y + "px" }}>
                    {(wheelAngles[2] * 180 / Math.PI).toFixed(1)}°
                </div>
            </div>
        </main>
    )
}
