"use client"

import "leaflet/dist/leaflet.css";
import { LatLng, Map, Point } from "leaflet";
import styles from "./page.module.css";
import Head from "next/head";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { IoAdd } from "react-icons/io5";
import dynamic from 'next/dynamic'
const MapComponent = dynamic(() => import("@/components/map-component/map-component"), { ssr: false });
// import { useEffect, useRef } from "react";





function WaypointList() {



    return <div className={styles["drive-control-panel"]}>
        <h2 style={{ marginBottom: "8px" }}>Waypoints</h2>
        <hr/>
        <ul className={styles["waypoint-list"]}>
            <li>
                <h4>School</h4>
                <input defaultValue={37.337367}/>°N
                <input defaultValue={-121.88267}/>°E
            </li>
            <li>
                <h4>Not School</h4>
                <input defaultValue={39.337367}/>°N
                <input defaultValue={-124.88267}/>°E
            </li>
        </ul>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className={styles["add-waypoint-button"]}>
                <IoAdd/>
            </div>
        </div>
    </div>;
}




export default function Navigation() {
    

    return (
        <main className={styles["main"]}>

            <Head>
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BM    Y="
                />
            </Head>
            <WaypointList/>
            <div className={styles["fullscreen-map"]}>  
                <MapComponent/>
            </div>
        </main>
    )
}
