"use client"
import { Fragment, useState } from "react";
import styles from "./page.module.css";
import { IoChevronDown } from "react-icons/io5";

const ScienceStatus = {
    FINISHED: 3,
    RUNNING: 2,
    READY: 1,
    WAITING: 0,
    SKIPPED: -1,
    FAILED: -2,
};

function statusToClass(status: number) : string{
    if(status === ScienceStatus.FINISHED) {
        return "finished";
    }else if(status === ScienceStatus.RUNNING) {
        return "running";
    }else if(status === ScienceStatus.READY) {
        return "ready";
    }else if(status === ScienceStatus.WAITING) {
        return "waiting";
    }else if(status === ScienceStatus.SKIPPED) {
        return "skipped";
    }else if(status === ScienceStatus.FAILED) {
        return "failed";
    }

    return "";
}

function ScienceStep({ step } : { step: { title: string, description: string, status: number } }) {
    return <div className={styles["task"] + " " + styles[statusToClass(step.status)]}>
        <h3>{step.title}</h3>
        <p>{step.description}</p>
    </div>
}


export default function Science() {

    const [ currentTask, setCurrentTask ] = useState(0);

    const steps = [
        { 
            title: "Revolve",
            description: "Move the revolving platform to the correct position.", 
            status: ScienceStatus.WAITING,
            value: 0 
        },
        { 
            title: "Seal Chamber",
            description: "Seal chamber to prevent the atmospheric gases from interfering with the experiment.",
            status: ScienceStatus.WAITING,
            value: 1 
        },
        { 
            title: "Depressurize Chamber", 
            description: "Depressurize chamber to remove atmospheric gases.",
            status: ScienceStatus.WAITING,
            value: 2 
        },
        { 
            title: "Inject Chemicals", 
            description: "Inject chamber with chemicals to perform experiment. Measure the results.",
            status: ScienceStatus.WAITING,
            value: 3 
        },
        { 
            title: "Clear Chamber", 
            description: "Clear chamber of chemicals and samples",
            status: ScienceStatus.WAITING,
            value: 4 
        },
        { 
            title: "Unseal Chamber", 
            description: "Repressurize the chamber and return to normal state",
            status: ScienceStatus.WAITING,
            value: 5 
        },

    ]





    return (
        <main className={styles["main"]}>
            <div className={styles["drive-control-panel"]}>
                <button onClick={(e) => {setCurrentTask((task) => task-1)}}>Prev</button>
                <button onClick={(e) => {setCurrentTask((task) => task+1)}}>Next</button>
                <div className={styles["task-list"]}>
                    <div>
                        <h3>Start</h3>
                        <IoChevronDown style={{fontSize: "32px", margin: "16px"}} className={(currentTask === 0 ? styles["ready"] : (currentTask > 0 ? styles["finished"] : ""))}/>
                        {steps.map((step, i) => {
                            return <Fragment key={i} >
                                <ScienceStep step={step}/>
                                <IoChevronDown style={{fontSize: "32px", margin: "16px" }} className={(currentTask === i+1 ? styles["ready"] : (currentTask > i+1 ? styles["finished"] : ""))}/>
                            </Fragment>
                        })}
                        <h3>Finish</h3>
                    </div>
                </div>

            </div>
            <div>
                <h2>Science Data Readout</h2>
                <p>We should put sensor outputs and related info here (rather than camera feeds).</p>
            </div>
        </main>
    )
}
