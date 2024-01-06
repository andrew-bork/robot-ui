
import styles from "./page.module.css";


export default function Telemetry() {

    return (
        <main className={styles["main"]}>
            <div className={styles["drive-control-panel"]}>
                <h2>Telemetry</h2>
                <p>This is the <i>blackbox</i> of the robot</p>
            </div>
        </main>
    )
}
