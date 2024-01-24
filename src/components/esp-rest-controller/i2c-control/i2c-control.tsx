import { LabeledGroup } from "@/components/labeled-group/labeled-group";
import { byteToNumber } from "@/string-type-checks";
import { useCallback, useEffect, useState } from "react";
import { ByteInput } from "../byte-input/byte-input";

import styles from "./i2c-control.module.css";
import { FrameView } from "../frame-view/frame-view";

import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { useRequest } from "@/request";

const ESP_ENDPOINT = "http://192.168.4.64";

function I2CSend() {
    const [ isRequesting, initiateRequest ] = useRequest();

    const [ deviceAddress, setDeviceAddress ] = useState("");
    const [ data, setData ] = useState<string[]>([""]);
    const [ responseSize, setResponseSize ] = useState("0");

    const [ lastRequestFrame, setLastRequestFrame ] = useState<number[]|null>(null);
    const [ lastResponseFrame, setLastResponseFrame ] = useState<number[]|null>(null);

    const setDataIndex = (s:string, i:number) => {
        setData((data) => data.map((original, j) => (j === i) ? s : original));
    }


    const deviceAddressNum = byteToNumber(deviceAddress);
    const dataNums = data.map((s) => byteToNumber(s));
    const responseSizeNum = byteToNumber(responseSize);

    const send = () => {
        initiateRequest(ESP_ENDPOINT+"/i2c/send", {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    device_address: deviceAddressNum,
                    response_size: responseSizeNum,
                    data: dataNums,
                })
            })
                .then((res) => res.json())
                .then((res : { success: boolean, recieved_data: number[] }) => {
                    setLastRequestFrame(dataNums);
                    setLastResponseFrame(res.recieved_data);
                })
    }

    const valid = !isNaN(deviceAddressNum) && !isNaN(responseSizeNum) && !dataNums.some(isNaN);

    return <>
        <table className={styles["input-table"]}>
            <tbody>
                <tr>
                    <th>Device Address:</th>
                    <td><ByteInput value={deviceAddress} onChange={setDeviceAddress}/></td>
                </tr>
                <tr>
                    <th>Data:</th>
                    <td>
                        {
                            data.map((byte, i) => {
                                return <ByteInput autoFocus={i != 0} key={i} value={byte} onChange={s => setDataIndex(s, i)} onBlur={() => {
                                    let newData = data;
                                    while(newData.length > 1 && newData[newData.length - 1] === "") {
                                        newData = newData.slice(0, newData.length - 1);
                                    }
                                    setData(newData);
                                }}/>
                            })
                        }

                        <ByteInput tabIndex={(data[data.length-1] === "" ? -1 : 0)} className={styles["ghost-byte"]} value={""} onChange={s => s} onFocus={(e) => {
    
                            const dataCopy = data.map(a => a);
                            dataCopy.push("");
                            setData(dataCopy);
                        }}/>
                    </td>
                </tr>
                <tr>
                    <th>Response Size:</th>
                    <td><ByteInput value={responseSize} onChange={setResponseSize}/></td>
                </tr>
            </tbody>
        </table>
        <button 
            disabled={!valid || isRequesting}
            className={styles["button"]}
            onClick={() => {
                send();
            }
        }>
            {(isRequesting ? 
                "Awaiting Response ..." :
                "Send I2C Message"
            )}
        </button>
        
        <div style={{margin: "8px"}}>
            {(lastRequestFrame ? <FrameView title="Last Request Frame" bytes={lastRequestFrame ?? []}/> : <></>)}
        </div>
        <div style={{margin: "8px"}}>
            {(lastResponseFrame ? <FrameView title="Last Response Frame" bytes={lastResponseFrame ?? []}/> : <></>)}
        </div>
    </>
}

function I2CProbe() {

    const [ isRequesting, initiateRequest ] = useRequest();
    const [ devices, setDevices ] = useState<number[]>([]);

    const probe = () => {
        initiateRequest(ESP_ENDPOINT+"/i2c/probe", {})
            .then((res) => res.json())
            .then((res : { success: boolean, devices: number[] }) => {
                setDevices(res.devices);
            });
    }

    const hexDigits = [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f" ];

    useEffect(() => {
        probe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <>
        <table className={styles["i2c-probe-table"]}>
            <tbody>
                <tr>
                    <td></td>
                    {hexDigits.map((digit, i) => {
                        return <th key={i}>0x_{digit}</th>
                    })}
                </tr>
                {hexDigits.slice(0, 8).map((digit, i) => {
                    return <tr key={i}>
                        <th>0x{digit}_</th>
                        {hexDigits.map((digit2, j) => {
                            return <td key={j}>{((devices.some((device) => device === (i * 16 + j))) ?  "0x" + digit + digit2 : "--")}</td>
                        })}
                    </tr>
                })}
            </tbody>
        </table>
        <button
            disabled={isRequesting}
            className={styles["button"]}
            onClick={() => {
                probe(); 
            }
        }>{(isRequesting ? 
            "Awaiting Response ..." :
            "Probe"
        )}</button>

    </>
}

interface TransactionResponse {
    success: boolean,
    response: number[],
    error_msg: string,
};

interface ReadRegisterTransaction {
    type: "read_register",
    device_address: number,
    register_address: number,
    response_size: number,

    response: TransactionResponse
};
interface WriteRegisterTransaction {
    type: "write_register",
    device_address: number,
    register_address: number,
    write_value: number,

    response: TransactionResponse
};
interface I2CTransaction {
    type: "i2c",
    device_address: number,
    data: number,
    response_size: number,

    response: TransactionResponse
};

type Transaction = ReadRegisterTransaction | WriteRegisterTransaction | I2CTransaction;

export function I2CView () {

    const [ transactionHistory, setTransactionHistory ] = useState<Transaction[]>([]);

    return <>
    <div
        style={{
            display: "grid",
            gridTemplateColumns: "auto 300px",
            gridTemplateRows: "100%",
            width: "100%",
            position: "relative"
        }}
    >
        <div style={{ padding: "16px", height: "100%" }}>
            <Tabs>
                <TabList>
                    <Tab>Probe</Tab>
                    <Tab>Send</Tab>
                </TabList>
                <TabPanel>
                    <I2CProbe/>
                </TabPanel>
                <TabPanel>
                    <I2CSend/>
                </TabPanel>
            </Tabs>
        </div>
        <div style={{ padding: "16px", height: "100%" }}>
            <h4>Recent Transmissions</h4>
            <hr/>
        </div>
    </div>
    </>
}