import { byteToNumber } from "@/string-type-checks";
import { useEffect, useState } from "react";
import { ByteInput } from "../byte-input/byte-input";

import styles from "./can-control.module.css";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { useRequest } from "@/request";

const ESP_ENDPOINT = "http://192.168.4.64";

function CANControlWindow() {
    const [ isRequesting, initiateRequest ] = useRequest();
    const [ frameID, setFrameID ] = useState("");
    // const [ deviceID, setDeviceID ] = useState("");
    const [ data, setData ] = useState(["0", "0", "0", "0", "0", "0", "0", "0"]);
    
    const setDataIndex = (s:string, i:number) => {
        setData((data) => data.map((original, j) => (j === i) ? s : original));
    }
    
    const frameIDNum = byteToNumber(frameID);
    // const deviceIDNum = byteToNumber(deviceID);
    const dataNums = data.map((s) => byteToNumber(s));

    const valid = !isNaN(frameIDNum) && !dataNums.some(isNaN);

    const sendCANFrame = () => {
        if(valid) {
            initiateRequest(ESP_ENDPOINT+"/can/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },  
                body: JSON.stringify({
                    frame_id: frameIDNum,
                    // device_id: deviceIDNum,
                    data: dataNums,
                })
            }).then((res) => res.json());
        }
    }

    return <>
        <div>
            <table className={styles["input-table"]}>
                <tbody>
                    <tr>
                        <th>Frame ID:</th>
                        <td><ByteInput value={frameID} onChange={setFrameID} byteCount={2}/></td>
                    </tr>
                    <tr>
                        <th>Data:</th>
                        <td>
                            <ByteInput value={data[0]} onChange={s => setDataIndex(s, 0)}/>
                            <ByteInput value={data[1]} onChange={s => setDataIndex(s, 1)}/>
                            <ByteInput value={data[2]} onChange={s => setDataIndex(s, 2)}/>
                            <ByteInput value={data[3]} onChange={s => setDataIndex(s, 3)}/>
                            <ByteInput value={data[4]} onChange={s => setDataIndex(s, 4)}/>
                            <ByteInput value={data[5]} onChange={s => setDataIndex(s, 5)}/>
                            <ByteInput value={data[6]} onChange={s => setDataIndex(s, 6)}/>
                            <ByteInput value={data[7]} onChange={s => setDataIndex(s, 7)}/>
                        </td>
                    </tr>
                </tbody>
            </table>
            <button 
                disabled={!valid || isRequesting}
                className={styles["button"]}
                onClick={() => {
                    sendCANFrame();
                }
            }>
            {(isRequesting ? 
                "Awaiting Response ..." :
                "Send CAN Frame"
            )}</button>
        </div>
    </>
}

export function CANView() {
    return (<>
        <Tabs>
            <TabList>
                {/* <Tab>Probe</Tab> */}
                <Tab>Send</Tab>
            </TabList>
            {/* <TabPanel>
                <CANProbe />
            </TabPanel> */}
            <TabPanel>
                <CANControlWindow/>
            </TabPanel>
        </Tabs>
    </>)
}