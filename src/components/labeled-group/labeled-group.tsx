import { ReactNode } from "react";
import styles from "./labeled-group.module.css";


interface InputGroupArgs {
    header: string,
    children?: ReactNode
}

export function LabeledGroup({ header, children } : InputGroupArgs) {
    return (<fieldset className={styles["input-group"]}>
                <legend className={styles["input-group-header"]}>{header}</legend>
                {children}
            </fieldset>);
}