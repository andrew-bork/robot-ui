"use client"

import { useGamepadList } from '@/components/gamepad-context/gamepad-context';
import styles from './page.module.css'
import { useEffect, useRef, useState } from "react";


function useAnimation(callback : FrameRequestCallback) {
    const callbackRef = useRef(callback);
    const animationFrameRef = useRef(-1);
    callbackRef.current = callback;
    useEffect(() => {
        const update = (now : number) => {
            callbackRef.current(now);
            animationFrameRef.current = requestAnimationFrame(update);
        }
        animationFrameRef.current = requestAnimationFrame(update);

        return () => {
            cancelAnimationFrame(animationFrameRef.current);
        }
    }, []);
}


function useGamepadState(index : number) {
    const [ gamepadState, setGamepadState ] = useState(navigator.getGamepads().find((gamepad) => gamepad?.index === index) as Gamepad);

    useAnimation(() => {
        const gamepad = navigator.getGamepads().find((gamepad) => gamepad?.index === index) as Gamepad;
        // console.log(gamepad);
        setGamepadState((gamepadState) => {
            if(gamepadState.timestamp != gamepad.timestamp) return gamepad;
            return gamepadState;
        });
    });

    return gamepadState;
} 


function AxisIndicator({ value } : { value : number }) {
    return <svg version="1.1" viewBox="0 0 5 35" className={styles["bar-indicator"]} xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" fill="none">
        <line strokeWidth={5} x1={2.5} y1={17.5} x2={2.5} y2={17.5 * value + 17.5}/>
    </svg>
}


function ButtonIndicator({ value } : { value : number }) {
    return <svg version="1.1" viewBox="0 0 5 35" className={styles["bar-indicator"]} xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" fill="none">
        <line strokeWidth={5} x1={2.5} y1={35} x2={2.5} y2={35.5 * (1 - value)}/>
    </svg>
}


function AxisPreview({ axisIndex, axisValue } : { axisIndex: number, axisValue: number }) {
    return <div
        style={{
            display: "inline-flex"
        }}>
        <AxisIndicator value={axisValue}/>
        <div className={styles["axis-label"]}>
            <label>Axis {axisIndex}</label>
            <div style={{width: "70px"}}>{axisValue.toFixed(4)}</div>
        </div>
    </div>
}
function ButtonPreview({ buttonIndex, buttonValue } : { buttonIndex: number, buttonValue: number }) {
    return <div
        style={{
            display: "inline-flex",
            alignItems: "center"
        }}>
        <ButtonIndicator value={buttonValue}/>
        <div className={styles["axis-label"]}>
            <label>B{buttonIndex}</label>
            <div style={{width: "50px"}}>{buttonValue.toFixed(2)}</div>
        </div>
    </div>
}

// function ButtonPreview

function GamepadPreview({ index } : { index: number}) {
    const gamepad = useGamepadState(index);

    return <li>{gamepad.index} - {gamepad.id} <br/>
        {gamepad.buttons.map((button, i) => <ButtonPreview key={i} buttonIndex={i} buttonValue={button.value}/>)}<br/>
        {gamepad.axes.map((axis, i) => <AxisPreview key={i} axisIndex={i} axisValue={axis}/>)}
    </li>
}



export default function GamepadPage() {

    const gamepads = useGamepadList();
    // useGamepadState(1);

    return <main>
        <h1>Gamepad</h1>
        <ul>
            {gamepads.map((gamepad, i) => {
                return <GamepadPreview key={i} index={gamepad.index}/>
            })}
        </ul>
    </main>
}