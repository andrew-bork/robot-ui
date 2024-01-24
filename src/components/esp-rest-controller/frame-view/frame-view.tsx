import { Fragment } from "react";
import styles from "./frame-view.module.css";

function leftpad(s : string, length: number, char : string = " ") {
    while(s.length < length) {
        s = char + s;
    }
    return s;
}

export function FrameView({ title, bytes } : { title?:string, bytes : number[] }) {
    return <table className={styles["frame-view"]}>
        <tbody>
            <tr>
                {(title ? <th rowSpan={5}>{title}</th> : <></>)}
                {bytes.map((_, i) => {
                    return <td key={i} colSpan={8}>data[{i}]</td>
                })}
            </tr>
            {/* <tr>
                {bytes.map((byte, i) => {
                    return <Fragment key={i}>
                        <td>7</td>
                        <td>6</td>
                        <td>5</td>
                        <td>4</td>
                        <td>3</td>
                        <td>2</td>
                        <td>1</td>
                        <td>0</td>
                    </Fragment>;
                })}
            </tr> */}
            <tr>
                {bytes.map((byte, i) => {
                    return <Fragment key={i}>
                        <td>{((byte & 0x80) === 0 ? "0" : "1")}</td>
                        <td>{((byte & 0x40) === 0 ? "0" : "1")}</td>
                        <td>{((byte & 0x20) === 0 ? "0" : "1")}</td>
                        <td>{((byte & 0x10) === 0 ? "0" : "1")}</td>
                        <td>{((byte & 0x08) === 0 ? "0" : "1")}</td>
                        <td>{((byte & 0x04) === 0 ? "0" : "1")}</td>
                        <td>{((byte & 0x02) === 0 ? "0" : "1")}</td>
                        <td>{((byte & 0x01) === 0 ? "0" : "1")}</td>
                    </Fragment>;
                })}
            </tr>
            <tr>
                {bytes.map((byte, i) => {
                    const hex = leftpad(byte.toString(16), 2, "0");
                    return <Fragment key={i}>
                        <td colSpan={4}>{hex[0]}</td>
                        <td colSpan={4}>{hex[1]}</td>
                    </Fragment>;
                })}
            </tr>
            <tr>
                {bytes.map((byte, i) => {
                    return <td key={i} colSpan={8}>{byte}</td>
                })}
            </tr>
            <tr>
                {bytes.map((byte, i) => {
                    return <td key={i} colSpan={8}>0x{leftpad(byte.toString(16), 2, "0")}({byte})</td>
                })}
            </tr>
        </tbody>
    </table>
}