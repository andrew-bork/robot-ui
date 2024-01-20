import styles from "./loader.module.css"

export function Loader() {
    return <div className={styles["container"]}>
            <div className={styles["loader"]}></div>
            Loading ...
        </div>
}