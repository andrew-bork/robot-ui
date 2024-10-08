"use client"
import { useWindowEvent } from "@/window-event";
import styles from "./TimelineSlider.module.css";







import { useEffect, useRef, Fragment, useMemo, useState } from "react";
import { ResizeFollower } from "../resize-follower/ResizeFollower";

export interface CustomRangeSliderArgs {
}


function useFrame(cb: () => void) {
    let currentFrame = useRef<number|null>(null);
    useEffect(() => {
        // let currentFram
        const then = 0;
        const render = (now:number) => {
            cb();
            currentFrame.current = requestAnimationFrame(render);
        }

        // render(then);
        requestAnimationFrame(render);
        return () => {
            if(currentFrame.current)
                cancelAnimationFrame(currentFrame.current);
        }
    });
}




function TickmarkTrack({ min, max, tickDistance, tickScale, primaryTickPeriod, secondaryTickPeriod, toText } : { min : number, max : number, tickScale : number, tickDistance : number, primaryTickPeriod : number, secondaryTickPeriod : number, toText : (x:number)=>string } ) {

    // Generate the tickmarks.
    const tickmarks = useMemo(() => {
        const tickmarks = [];

        for(let i = 0; (i * tickDistance + min) <= max; i ++) {
            let length = 8;
            let hasText = false;
            let tickPosition = (i * tickDistance + min) * tickScale + 10;
            if(i % primaryTickPeriod === 0) {
                length = 32;
                hasText = true;
            }
            else if(i % secondaryTickPeriod === 0) {
                length = 16;
                hasText = false;
            }
            tickmarks.push({ value: i * tickDistance + min, length, hasText, tickPosition });
        }


        return tickmarks;
    }, [min, max, tickDistance, tickScale, primaryTickPeriod, secondaryTickPeriod ]);
    return tickmarks.map((tick, i) => {
        return <Fragment key={i}>
            <line x1={tick.tickPosition} x2={tick.tickPosition} y1={4} y2={4 + tick.length} stroke='#ffffff' strokeWidth={2} vectorEffect="non-scaling-stroke"></line>
            {(tick.hasText ? <text x={tick.tickPosition} y={10+tick.length} fontSize='10' textAnchor="middle" dominantBaseline="hanging" stroke="none" fill="#ffffff" style={{userSelect: "none"}}>{toText(tick.value)}</text> : <></>)}
        </Fragment>
    })

}

export function TimelineSlider({ } : CustomRangeSliderArgs ) {

    const svg = useRef<SVGSVGElement|null>(null);
    const isMouseDown = useRef(false);
    const mouseButton = useRef(0);
    const isMouseOver = useRef(false);

    // Move Value ref. This is to propagate the onChange state to the window events.
    
    // Change the value by value dx.
    const moveValue = useRef((dx : number)=>{
        // let newValue = (value + dx / tickScale);
        // if(infinite) {
        //     if(newValue > max) newValue -= (max - min);
        //     else if(newValue < min) newValue += (max - min);
        // }else {
        //     newValue = Math.min(max, Math.max(min, newValue));
        // }
        // onChange(newValue);
    });

    // Sync the changes with the ref.
    moveValue.current = (dx : number)=>{
        // let newValue = (value + dx / tickScale) ;
        // if(infinite) {
        //     if(newValue > max) newValue -= (max - min);
        //     else if(newValue < min) newValue += (max - min);
        // }else {
        //     newValue = Math.min(max, Math.max(min, newValue));
        // }
        // onChange(newValue);
    };


    // Attach Window Listeners
    useWindowEvent("mousemove", (e : any) => {
        if(isMouseDown.current) {
            if(svg.current != null) {
                const rect = svg.current.getBoundingClientRect();
                if(mouseButton.current === 0) {
                    moveValue.current(-(96 * e.movementX / rect.width));
                }else {
                    moveValue.current(-(e.movementX / rect.width));
                }
            }
        }
    });
    useWindowEvent("mouseup", (e:any)=> {
        if(isMouseDown.current) {
            isMouseDown.current = false;
        }
    });
    useWindowEvent("wheel", (e:any) => {
        if(isMouseOver.current) {
            // let dy = 1;
            // if(e.deltaY < 0) dy = -1;
            moveValue.current(e.deltaY * 0.01);
        }

    });

    // const [ size, setSize ] = setSize()
    // const canvas = useRef<HTMLCanvasElement>(null!);
    // const size = useRef({ width: 0, height: 0});

    const [ size, setSize ] = useState({ width: 0, height: 0});

    // useFrame(() => {
    //     const ctx = canvas.current.getContext("2d");
    //     if(ctx == null) return;

    //     let width = size.current.width; 
    //     let height = size.current.height;

    //     let halfWidth = width / 2;
    //     let halfHeight = height / 2;
        
    //     ctx.clearRect(0, 0, width, height);

    //     ctx.moveTo(0, halfHeight);
    //     ctx.lineTo(width, halfHeight);
    //     ctx.lineWidth = 2;
    //     ctx.strokeStyle = `#646464`;
    //     ctx.stroke();


    // });

    // return <div></div>
    return <ResizeFollower 
        style={{
            height: `64px`
        }}
    onSize={(newSize) => {
        setSize(newSize);
        // size.current.width = newSize.width;
        // size.current.height = newSize.height;
        // canvas.current.width = newSize.width;
        // canvas.current.height = newSize.height;
    }}>
        <svg version="1.1" viewBox={`0 -12 ${size.width} 64`} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            {/* <rect x="0" y="0" width="10" height="10"></rect> */}
            <TickmarkTrack min={0} max={100}
                toText={(x) => {
                    return `${x}`;
                }}
                tickDistance={1}
                tickScale={(size.width - 20)/100}
                primaryTickPeriod={10}
                secondaryTickPeriod={5}
            />

            <line x1={10} x2={10} y1={4} y2={30} stroke='#1a77c4' strokeWidth={2} vectorEffect="non-scaling-stroke"></line>
            {/* <path d=""></path> */}
        </svg>
        {/* <canvas ref={canvas}></canvas> */}
    </ResizeFollower>


}