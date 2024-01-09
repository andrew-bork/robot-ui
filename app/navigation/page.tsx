"use client"

import "leaflet/dist/leaflet.css";
import { LatLng, Map } from "leaflet";
import styles from "./page.module.css";
import { MapContainer, SVGOverlay, TileLayer, useMap, useMapEvent } from 'react-leaflet'
import Head from "next/head";
import Script from "next/script";
import { useState } from "react";
// import { useEffect, useRef } from "react";


export default function Telemetry() {
    const position = new LatLng(0, 0);

    // const fullscreenMapRef = useRef<HTMLDivElement|null>(null);
    // const mapRef = useRef<Map|null>(null);


    // useEffect(() => {
    //     if(fullscreenMapRef.current) {
    //         // mapRef.current = 
    //     }
    // }, []);

    const robotLocation = new LatLng(37.337367, -121.88267);

    return (
        <main className={styles["main"]}>

            <Head>
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BM    Y="
                />
            </Head>
            <div className={styles["drive-control-panel"]}>
                <h2>Waypoints</h2>
            </div>
            <div className={styles["fullscreen-map"]}>
            <MapContainer center={robotLocation} zoom={13}>
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

            </MapContainer>
            </div>
        </main>
    )
}
