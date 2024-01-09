"use client"
import Image from 'next/image'
import styles from './page.module.css'
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { Vector, Vector2D } from '@/vector'
import { AngleRangeSlider, CustomRangeSlider } from '@/components/custom-range-slider/CustomRangeSlider'


interface Size {
    width: number,
    height: number
}



function calculateWheelAngles(wheelLocations : Vector2D[], steeringAngle: number, angle: number) {
    const radius = 1 / Math.tan(steeringAngle);
    if(!isFinite(radius)) return [ -angle, -angle, -angle ];
    const turningCircleCenter = Vector.polar(radius, Math.PI/2 - angle);
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
    if(steeringAngle > 0) angles[0] += Math.PI / 2;
    else angles[0] -= Math.PI / 2;
    if(steeringAngle > 0) angles[1] += Math.PI / 2;
    else angles[1] -= Math.PI / 2;
    if(steeringAngle > 0) angles[2] += Math.PI / 2;
    else angles[2] -= Math.PI / 2;

    // angles[0] -= Math.PI / 2;
    // angles[1] -= Math.PI / 2;
    // angles[2] -= Math.PI / 2;

    return angles;
}

function calculateWheelSpeeds(wheelLocations : Vector2D[], speed: number, radius: number, angle: number) {
    if(!isFinite(radius)) return [ speed, speed, speed ];
    const turningCircleCenter = Vector.polar(radius, Math.PI/2 - angle);
    const imaginaryWheelDistance = Math.sqrt(radius * radius + 1);
    const directions = [
        Vector.sub(wheelLocations[0], turningCircleCenter),
        Vector.sub(wheelLocations[1], turningCircleCenter),
        Vector.sub(wheelLocations[2], turningCircleCenter),
    ];

    return [
        speed * Vector.mag(directions[0]) / imaginaryWheelDistance,
        speed * Vector.mag(directions[1]) / imaginaryWheelDistance,
        speed * Vector.mag(directions[2]) / imaginaryWheelDistance,
    ];
}



function drawWheels(ctx : CanvasRenderingContext2D, wheelLocations: Vector2D[], wheelAngles: number[], map: (pos: Vector2D) => Vector2D) {    
    wheelLocations.forEach((location) => {
        const mapped = map(location);
        ctx.beginPath();
        ctx.ellipse(mapped.x, mapped.y, 5, 5, 0, 0, 2 * Math.PI);
        ctx.stroke();
    });

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
}

function drawTriangle(ctx : CanvasRenderingContext2D, center: Vector2D, size: number) {
    ctx.beginPath();
    ctx.moveTo(center.x, center.y - size);
    ctx.lineTo(center.x + Math.sqrt(3) * size / 2, center.y + size / 2);
    ctx.lineTo(center.x - Math.sqrt(3) * size / 2, center.y + size / 2);
    ctx.lineTo(center.x, center.y - size);
    ctx.stroke();
}


function drawDirectionArc(ctx : CanvasRenderingContext2D, center: Vector2D, position: Vector2D, arcLength:number, direction: boolean, size: Size) {
    const dir = Vector.sub(position, center);
    const radius = Vector.mag(dir);

    if(isFinite(radius)){
        const angleRange = Math.min(arcLength / radius, Math.PI);
        const angle = Math.atan2(dir.y, dir.x);
        
        if(direction) {
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(center.x, center.y, radius, angle, angle + angleRange);
            ctx.stroke();
            
            ctx.strokeStyle = "#bbbbbb";
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(center.x, center.y, radius, angle-angleRange, angle);
            ctx.stroke();

        }else {
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(center.x, center.y, radius, angle-angleRange, angle);
            ctx.stroke();

            ctx.strokeStyle = "#bbbbbb";
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(center.x, center.y, radius, angle, angle + angleRange);
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

function drawHexagon(ctx : CanvasRenderingContext2D, center: Vector2D, radius: number) {
    const HALF_SQRT_3 = Math.sqrt(3) / 2;
    ctx.beginPath();
    ctx.moveTo(center.x - radius, center.y);
    ctx.lineTo(center.x - radius / 2, center.y - radius * HALF_SQRT_3);
    ctx.lineTo(center.x + radius / 2, center.y - radius * HALF_SQRT_3);
    ctx.lineTo(center.x + radius, center.y);
    ctx.lineTo(center.x + radius / 2, center.y + radius * HALF_SQRT_3);
    ctx.lineTo(center.x - radius / 2, center.y + radius * HALF_SQRT_3);
    ctx.lineTo(center.x - radius, center.y);
    ctx.stroke();
}

export default function Drive() {

    const [ ctx, setCtx] = useState<CanvasRenderingContext2D|null>(null);
    const [ size, setSize ] = useState<Size>({ width: 200, height: 200 });

    const [ steeringAngle, setSteeringAngleState ] = useState(0);
    const [ steeringAxisAngle, setSteeringAxisAngle ] = useState(0);
    const [ speed, setSpeedState ] = useState(0);
    // const [ maxAngularSpeed, setMaxAngularSpeed ] = useState(0);

    const waypoint = { x: 1, y: 1 };
    const waypointAngle = Math.PI/2;

    const MAX_SPEED = 2;
    const MAX_ANGULAR_SPEED_DEG = 15;
    const MAX_ANGULAR_SPEED = MAX_ANGULAR_SPEED_DEG * Math.PI / 180;

    const steeringAngleRadians = steeringAngle * Math.PI / 180;
    const steeringAxisAngleRadians = steeringAxisAngle * Math.PI / 180;

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
    const turningRadius = 1 / Math.tan(steeringAngleRadians);
    const imaginaryWheelDist = Math.sqrt(1 + turningRadius * turningRadius);

    const maxSpeed = MAX_ANGULAR_SPEED * imaginaryWheelDist;
    const maxAngularSpeed = MAX_SPEED / imaginaryWheelDist;

    const turningCircleCenter = { x: turningRadius * Math.cos(steeringAxisAngleRadians), y: turningRadius * Math.sin(steeringAxisAngleRadians) };

    const wheelAngles = calculateWheelAngles(wheelLocations, steeringAngleRadians, steeringAxisAngleRadians);
    let wheelSpeeds = calculateWheelSpeeds(wheelLocations, speed, turningRadius, steeringAxisAngleRadians);



    const setSpeed = (newSpeed : number, turningRadius: number) => {
        const newAngularSpeed = newSpeed / turningRadius;
        if(newAngularSpeed > MAX_ANGULAR_SPEED) {
            setSpeedState(MAX_ANGULAR_SPEED * turningRadius);
        }else if(newAngularSpeed < -MAX_ANGULAR_SPEED) {
            setSpeedState(-MAX_ANGULAR_SPEED * turningRadius);
        }else {
            setSpeedState(newSpeed);
        }
    }

    const setAngularSpeed = (newAngularSpeed : number, turningRadius: number) => {
        if(isFinite(turningRadius)) {
            const newSpeed = newAngularSpeed * turningRadius;
            if(newSpeed > MAX_SPEED) {
                setSpeedState(MAX_SPEED);
            }else if(newSpeed < -MAX_SPEED) {
                setSpeedState(-MAX_SPEED);
            }else {
                setSpeedState(newSpeed);
            }
        }
    }

    const setSteeringAngle = (newSteeringAngle : number) => {
        const newTurningRadius = 1 / Math.tan(newSteeringAngle * Math.PI / 180);
        const imaginaryWheelDist = Math.sqrt(1 + newTurningRadius * newTurningRadius) * (newSteeringAngle < 0 ? -1 : 1);
        setSteeringAngleState(newSteeringAngle);
        setSpeed(speed, imaginaryWheelDist);
    }


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


            drawWheels(ctx, wheelLocations, wheelAngles, map);

            const turningCircleCenterMapped = map(turningCircleCenter);
            drawTriangle(ctx, turningCircleCenterMapped, 5);

            ctx.strokeStyle = "#333333";
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            const r = size.width / 2 + size.height / 2;

            ctx.moveTo(-r * Math.cos(steeringAxisAngleRadians) + size.width / 2, r * Math.sin(steeringAxisAngleRadians) + size.height / 2);
            ctx.lineTo(r * Math.cos(steeringAxisAngleRadians) + size.width / 2, -r * Math.sin(steeringAxisAngleRadians) + size.height / 2);
            // ctx.moveTo(0, size.height / 2);
            // ctx.lineTo(size.width, size.height/2);
            ctx.stroke();

            {
                const direction = (steeringAngle < 0) === (speed > 0);
                const arcLength = 100;
                drawDirectionArc(ctx, turningCircleCenterMapped, { x: size.width/2, y: size.height/2 }, arcLength, direction, size);

                drawDirectionArc(ctx, turningCircleCenterMapped, map(wheelLocations[0]), 200, direction, size);
                drawDirectionArc(ctx, turningCircleCenterMapped, map(wheelLocations[1]), 200, direction, size);
                drawDirectionArc(ctx, turningCircleCenterMapped, map(wheelLocations[2]), 200, direction, size);

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

            const waypointMapped = map(waypoint);
            ctx.strokeStyle = "#b969d6";
            drawHexagon(ctx, waypointMapped, 15);
            const waypointDir = Vector.polar(10000, waypointAngle);
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.moveTo(waypointMapped.x - waypointDir.x, waypointMapped.y - waypointDir.y);
            ctx.lineTo(waypointMapped.x, waypointMapped.y);
            ctx.stroke();
            ctx.setLineDash([]);

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
                <h4>Speed:</h4>
                <CustomRangeSlider
                    infinite={false}
                    min={-MAX_SPEED} max={MAX_SPEED} 
                    tickAmount={0.1} primaryTickPeriod={10} secondaryTickPeriod={5} 
                    tickScale={40} 
                    value={speed} 
                    toText={(value) => value.toFixed(1)} 
                    barberMin={-maxSpeed}
                    barberMax={maxSpeed}
                    onChange={(value) => {setSpeed(value, imaginaryWheelDist)}}/>
                <h4>Angular Speed</h4>
                <CustomRangeSlider 
                    infinite={false}
                    min={-MAX_ANGULAR_SPEED_DEG} max={MAX_ANGULAR_SPEED_DEG} 
                    
                    tickAmount={1} 
                    tickScale={5} 
                    primaryTickPeriod={15} 
                    secondaryTickPeriod={5} 
                    
                    barberMin={-maxAngularSpeed * 180 / Math.PI}
                    barberMax={maxAngularSpeed * 180 / Math.PI}
                    
                    value={(speed / imaginaryWheelDist) * 180 / Math.PI} 
                    toText={(value) => value.toFixed(1)+"°/s"} 
                    onChange={(value) => {setAngularSpeed(value * Math.PI / 180, imaginaryWheelDist)}}/>
                <h4>Steering angle:</h4>
                <AngleRangeSlider 
                    infinite={true} 
                    min={-180} max={180} 
                    tickScale={1} 
                    tickAmount={5} 
                    
                    primaryTickPeriod={18} 
                    secondaryTickPeriod={6} 
                    
                    value={steeringAngle} 
                    onChange={(value) => {setSteeringAngle(value)}}/>
                <h4>Steering axis angle</h4>
                <AngleRangeSlider infinite={true} min={-180} max={180} tickScale={1} primaryTickPeriod={18} secondaryTickPeriod={6} tickAmount={5} value={steeringAxisAngle} toText={(value) => value.toFixed(1)+"°"} onChange={(value) => {setSteeringAxisAngle(value)}}/>

            </div>
            <div ref={div} style={{maxWidth: "100%", height: "100%", position: "relative"}}>
                <canvas ref={canvas} style={{ position: "absolute" }}></canvas>
                <div style={{ position: "absolute", left: wheel0TextLocation.x + "px", top: wheel0TextLocation.y + "px" }}>
                    {(wheelAngles[0] * 180 / Math.PI).toFixed(1)}° <br/>
                    {(wheelSpeeds[0]).toFixed(1)} mph
                </div>
                <div style={{ position: "absolute", left: wheel1TextLocation.x + "px", top: wheel1TextLocation.y + "px" }}>
                    {(wheelAngles[1] * 180 / Math.PI).toFixed(1)}° <br/>
                    {(wheelSpeeds[1]).toFixed(1)} mph
                </div>
                <div style={{ position: "absolute", left: wheel2TextLocation.x + "px", top: wheel2TextLocation.y + "px" }}>
                    {(wheelAngles[2] * 180 / Math.PI).toFixed(1)}° <br/>
                    {(wheelSpeeds[2]).toFixed(1)} mph
                </div>
            </div>
        </main>
    )
}
