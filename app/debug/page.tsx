"use client"

import { FocusEventHandler, Fragment, ReactElement, RefObject, Reference, useCallback, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";import { byteToNumber } from "@/string-type-checks";
import { ByteInput } from "@/components/esp-rest-controller/byte-input/byte-input";
import { FrameView } from "@/components/esp-rest-controller/frame-view/frame-view";
import { Spinner } from "@/components/loader/spinner";
import { LabeledGroup } from "@/components/labeled-group/labeled-group";
import { I2CView } from "@/components/esp-rest-controller/i2c-control/i2c-control";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { CANView } from "@/components/esp-rest-controller/can-control/can-control";


const ESP_ENDPOINT = "http://192.168.4.64";

export default function DebugPage() {
    return <main className={styles["main"]}>
        <LabeledGroup header="ESP Rest Controller">
            
            <Tabs>
                <TabList>
                    <Tab>I<sup>2</sup>C</Tab>
                    <Tab>CAN</Tab>
                </TabList>
                <TabPanel>
                    <I2CView/>
                </TabPanel>
                <TabPanel>
                    <CANView/>
                </TabPanel>
            </Tabs>
        </LabeledGroup>
    </main>
}