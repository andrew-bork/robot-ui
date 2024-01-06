"use client"

import { ReactElement, useState } from "react";
import styles from "./page.module.css";
import { AngleRangeSlider, CustomRangeSlider } from "@/components/custom-range-slider/CustomRangeSlider";

interface InputGroupArgs {
    header: string,
    children: undefined|ReactElement|ReactElement[]
}

function InputGroup({ header, children } : InputGroupArgs) {
    return (<fieldset className={styles["input-group"]}>
                <legend className={styles["input-group-header"]}>{header}</legend>
                {children}
            </fieldset>);
        }


export default function Settings() {
    const [ testAngle, setTestAngle ] = useState(0);

    return <main className={styles["main"]}>
        <div>
            <h1>Settings</h1>
            <p>This is for parameters that should be set before a <i>mission</i> (driving the robot) is started.</p>
            <InputGroup header="Robot Endpoints">
                <h5>Main</h5>
                <input className={styles["text-input"]} defaultValue="http://localhost:5000/endpoint"/><br/>
                <h5>Arm</h5>
                <input className={styles["text-input"]}/><br/>
                <h5>Mimic</h5>
                <input className={styles["text-input"]}/>
            </InputGroup>
            <InputGroup header="Inputs">
                <AngleRangeSlider value={testAngle} onChange={setTestAngle}/>
                <AngleRangeSlider value={testAngle} onChange={setTestAngle} infinite={true}/>
            </InputGroup>
            <InputGroup header="More Settings">
                <p>No clue what to put here</p>
            </InputGroup>
        </div>
    </main>
}