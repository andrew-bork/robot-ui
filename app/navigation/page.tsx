"use client"

import "leaflet/dist/leaflet.css";
import { LatLng, Map, Point } from "leaflet";
import styles from "./page.module.css";
import { LayersControl, MapContainer, SVGOverlay, TileLayer, useMap, useMapEvent } from 'react-leaflet'
import Head from "next/head";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { IoAdd } from "react-icons/io5";
// import { useEffect, useRef } from "react";





function WaypointMarker({ x, y } : { x: number, y: number }) {
    return <svg 
        version="1.1" 
        viewBox="-1 -1 2 2" 
        xmlns="http://www.w3.org/2000/svg" 
        style={{
            width: "50px", 
            height: "50px", 
            position: "absolute", 
            left: `${x}px`, 
            top: `${y}px`, 
            zIndex: "1000",
            transform: "translate(-50%, -50%)"
            }}>
        <path stroke="#dc61f2" fill="none" d="M 0 -0.5 l 0.5 0.5 l -0.5 0.5 l -0.5 -0.5 z" strokeWidth={2} vectorEffect="non-scaling-stroke"/>
    </svg>
}



function WaypointLayer() {
    const map = useMap();
    const robotLocation = new LatLng(37.337367, -121.88267);
    const [ point, setPoint ] = useState(new Point(0, 0));

    useMapEvent("zoom", () => {
        setPoint(map.latLngToContainerPoint(robotLocation));
    });

    useMapEvent("move", () => {
        setPoint(map.latLngToContainerPoint(robotLocation));
    });

    return <div style={{width: "100%", height: "100%", zIndex: "1000"}}>
        <WaypointMarker x={point.x} y={point.y}/>
    </div>
}



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
            <li style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className={styles["add-waypoint-button"]}>
                    <IoAdd/>
                </div>
            </li>
        </ul>
    </div>;
}




export default function Navigation() {
    const position = new LatLng(0, 0);


    
    const robotLocation = new LatLng(37.337367, -121.88267);

    return (
        <main className={styles["main"]}>

            <Head>
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BM    Y="
                />
            </Head>
            <WaypointList/>
            <div className={styles["fullscreen-map"]}>
            <MapContainer center={robotLocation} zoom={13}>
                <LayersControl position="topright">
                    <LayersControl.Overlay name="Open Street Map">
                        <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                    </LayersControl.Overlay>
                    <LayersControl.Overlay name="USGS Topographic">
                        <TileLayer
                            // attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.Overlay>
                    <LayersControl.Overlay name="USGS Imagery Only">
                        <TileLayer
                            // attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.Overlay>
                    <LayersControl.Overlay name="USGS Imagery & Topographic">
                        <TileLayer
                            // attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.Overlay>
                    <LayersControl.Overlay name="USGS Shaded Relief">
                        <TileLayer
                            // attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.Overlay>
                    <LayersControl.Overlay name="ArcGis">
                        <TileLayer
                            url="http://services.arcgisonline.com/ArcGis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png"/>
                    </LayersControl.Overlay>
                    <LayersControl.Overlay name="Waypoints">
                        <WaypointLayer/>
                    </LayersControl.Overlay>
                </LayersControl>

            </MapContainer>
            </div>
        </main>
    )
}
