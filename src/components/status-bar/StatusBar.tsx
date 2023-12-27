import styles from "./StatusBar.module.css";

import { TbSteeringWheel } from "react-icons/tb";
import { IoFlaskOutline } from "react-icons/io5";
import { GiMechanicalArm } from "react-icons/gi";
import { FaArrowTrendUp } from "react-icons/fa6";

export default function StatusBar() {
    return <div className={styles["status-bar"]}>
        <div className={styles["left-float"]}>
            <a className={styles["view-link"]} href="/drive">
                <TbSteeringWheel/>
            </a>
            <a className={styles["view-link"]} href="/">
                <IoFlaskOutline/>
            </a>
            <a className={styles["view-link"]} href="/">
                <GiMechanicalArm/>
            </a>
            <a className={styles["view-link"]} href="/">
                <FaArrowTrendUp/>
            </a>
        </div>

        <div className={styles["center-float"]}>
            <div style={{display:"flex", flexDirection:"column", alignItems: "flex-start"}}>
                <span style={{ fontSize: "9px" }} >Current State</span>
                <span style={{ fontSize: "12px" }} ><strong>Configuring</strong></span>
            </div>
        </div>

        <div className={styles["right-float"]}>
            <div>A</div>
            <div>B</div>
            <div>C</div>
        </div>
    </div>
}