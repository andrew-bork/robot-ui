"use client"
import styles from "./StatusBar.module.css";

import { TbSteeringWheel } from "react-icons/tb";
import { IoFlaskOutline, IoSettingsOutline, IoPulse, IoHardwareChipOutline, IoMapOutline } from "react-icons/io5";
import { GiMechanicalArm } from "react-icons/gi";


import Link from "next/link";

// import { NavLink } from "react-router-dom   "
import { usePathname } from 'next/navigation';

export default function StatusBar() {  
  const pathname = usePathname();

    return <div className={styles["status-bar"]}>
        <div className={styles["left-float"]}>

            <Link href="/drive" prefetch={true}>
                <TbSteeringWheel className={styles["view-link"] + " " + (pathname === "/drive" ? styles["view-link-active"] : "")}/>
            </Link>
            
            <Link href="/science" prefetch={true}>
                <IoFlaskOutline className={styles["view-link"] + " " + (pathname === "/science" ? styles["view-link-active"] : "")}/>
            </Link>
            
            <Link href="/" prefetch={true}>
                <GiMechanicalArm className={styles["view-link"] + " " + (pathname === "/" ? styles["view-link-active"] : "")}/>
            </Link>
            <Link href="/navigation" prefetch={true}>
                <IoMapOutline className={styles["view-link"] + " " + (pathname === "/navigation" ? styles["view-link-active"] : "")}/>
            </Link>
            <Link href="/" prefetch={true}>
                <IoHardwareChipOutline className={styles["view-link"] + " " + (pathname === "/" ? styles["view-link-active"] : "")}/>
            </Link>
            <Link href="/telemetry" prefetch={true}>
                <IoPulse className={styles["view-link"] + " " + (pathname === "/telemetry" ? styles["view-link-active"] : "")}/>
            </Link>
            <Link href="/settings" prefetch={true}>
                <IoSettingsOutline className={styles["view-link"] + " " + (pathname === "/settings" ? styles["view-link-active"] : "")}/>
            </Link>
        </div>

        <div className={styles["center-float"]}>
            <div style={{display:"flex", flexDirection:"column", alignItems: "flex-start"}}>
                <span style={{ fontSize: "9px" }} >Current State</span>
                <span style={{ fontSize: "12px" }} ><strong>Robot Unconnected</strong></span>
            </div>
        </div>

        <div className={styles["right-float"]}>
            <div>A</div>
            <div>B</div>
            <div>C</div>
        </div>
    </div>
}