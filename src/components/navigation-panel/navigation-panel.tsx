"use client"

import { ReactElement, useMemo } from "react";

/**
 * This is a navigation display based on the Boeing 737 Navigation display.
 * It is an SVG React element.
 * 
 * ALL UNITS PASSED IN AS ARGS ARE IN RADIANS, KILOMETERS (INCLUDING COORDINATES)
 */

interface Coordinate {
    lat: number,
    long: number,
};

interface Waypoint {
    location: Coordinate,

    label?: string,
    range?: number,
    color?: string,
};

interface PolarPoint {
    r: number,
    theta: number,

    label?: string,
    color?: string,
};

interface NavigationPanelArgs {

    heading: number,
    location: Coordinate

    headingSetpoint?: number,

    magnometerHeading?: number,

    waypoints?: Waypoint[]

    lidar?: PolarPoint[],

    viewportSize: number,

};


function nearestTen(angleRad : number) {
    return Math.round((angleRad * RAD_TO_DEG) / 10);
}

function nearestDegree(angleRad:number) {
    return Math.round((angleRad * RAD_TO_DEG));
}

const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = 1 / RAD_TO_DEG;

function TickmarkTrack({ tickSpace, primaryTickPeriod, secondaryTickPeriod } : { tickSpace : number, primaryTickPeriod : number, secondaryTickPeriod : number }) {
    const tickmarks = useMemo(() => {
        const tickmarks = [];
        
        for(let i = 0; i * tickSpace  < Math.PI * 2; i ++) {
            let angle = i*tickSpace;
            if(i % primaryTickPeriod == 0) {
                tickmarks.push({
                    angle,
                    length: 0.7,
                    hasText: true,
                });
            }else if(i % secondaryTickPeriod == 0) {
                tickmarks.push({
                    angle,
                    length: 0.7,
                    hasText: false,
                });
            }else {
                tickmarks.push({
                    angle,
                    length: 0.35,
                    hasText: false,
                });
            }
        }
        
        return tickmarks;
    }, [tickSpace, primaryTickPeriod, secondaryTickPeriod]);

    return (tickmarks.map((tick, i) => {
        return (<g key={i} transform={`rotate(${tick.angle * RAD_TO_DEG}, 16, 16)`}>
            <line x1={16} y1={4} x2={16} y2={4 + tick.length} strokeWidth={2} vectorEffect="non-scaling-stroke"></line>
            {tick.hasText ? <text fontSize={0.6} x={16} y={4.2 + tick.length} textAnchor="middle" dominantBaseline="hanging" stroke="none" fill="#ffffff">{nearestTen(tick.angle)}</text> : <></>}
        </g>)
    }));
}


function DistanceRings({ viewportSize, ringDist } : { viewportSize : number, ringDist : number }) {
    const rings = [];
    for(let dist = ringDist; dist < viewportSize; dist += ringDist) {
        rings.push({
            dist,
            text: dist + " m"
        });
    }

    return (<g stroke="#dddddd">
        {rings.map((ring, i) => {
            return <g key={i}>
                <circle cx={16} cy={16} r={12 * ring.dist / viewportSize} strokeWidth={0.5} vectorEffect="non-scaling-stroke"></circle>
                <text x={16.3 + 12 * ring.dist / viewportSize} y={16} fontSize={0.6} stroke="none" fill="#ffffff">{ring.text}</text>
            </g>
        })}
    </g>)
}

function WaypointMarker() {
    return (<path d="M 0 -0.5 l 0.5 0.5 l -0.5 0.5 l -0.5 -0.5 z" strokeWidth={2} vectorEffect="non-scaling-stroke"/>)
}

function LidarMarker() {
    return (<path d="M 0 -0.1 L 0.087 0.05 L -0.087 0.05 z" strokeWidth={1} vectorEffect="non-scaling-stroke" shapeRendering="optimizeSpeed"/>)
}



function hav(t : number) : number {
    const sin = Math.sin(t/2);
    return sin * sin;
    return (1 - Math.cos(t)) / 2; // Wikipedia says this is less accurate. https://en.wikipedia.org/wiki/Haversine_formula
}

const EarthR_M = 6.371e6;

const SphericalNavigation = {
    /**
     * Get the current bearing needed to be on the most direct path towards the target location.
     * This is the bearing needed to follow the great circle arc between the two points.
     * NOTE This bearing is not constant. It will varying along the path. If your looking for a constant bearing path, see rhumb lines.
     * 
     * @param current Current location
     * @param target Target location
     * @returns Bearing at the current location needed to reach the target.
     */
    getForwardAzimuthBetween(current:Coordinate, target:Coordinate) : number {
        // https://en.wikipedia.org/wiki/Azimuth
        const y = Math.sin(target.long - current.long) * Math.cos(target.lat);
        const x = Math.cos(current.lat) * Math.sin(target.lat) - Math.sin(current.lat) * Math.cos(target.lat) * Math.cos(target.long - current.long);

        const angle =  Math.atan2(y, x);
        if(angle < 0) {
            return angle + Math.PI * 2;
        }
        return angle;
    },

    /**
     * Get the shortest distance between two coordinates.
     * This effectively gets the length of the great circle arc between the two points.
     * 
     * @param current Current location
     * @param target Target location
     * @returns Distance between the coordinates in meters
     */
    getDistanceBetween(current:Coordinate, target:Coordinate) : number {
        const dLong = target.long - current.long;
        const dLat = target.lat - current.lat;
        
        // https://en.wikipedia.org/wiki/Haversine_formula
        const a = hav(dLong) * Math.cos(current.lat) * Math.cos(target.lat) + hav(dLat);  // hav(c)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return EarthR_M * c;
    }
}



export function NavigationPanel(args : NavigationPanelArgs) {

    const heading = args.heading;



    

    return (<svg version="1.1" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" fill="none">
        <circle cx={16} cy={16} r={12} strokeWidth={2} vectorEffect="non-scaling-stroke"></circle>
        <clipPath id="nav-track-clip">
            <circle cx={16} cy={16} r={12} ></circle>
        </clipPath>

        <DistanceRings viewportSize={args.viewportSize} ringDist={1}/>

        <g clipPath="url(#nav-track-clip)">
            {args.lidar != null ? 
                <g stroke="#aa3322">
                    {
                        args.lidar.map((point, i) => {
                            return <g key={i} transform={`rotate(${point.theta * RAD_TO_DEG}, 16, 16) translate(16 ${16 - 12 * point.r / args.viewportSize}) rotate(${(-point.theta) * RAD_TO_DEG})`} >
                                <LidarMarker/>
                            </g>
                        })
                    }
                </g>
            : <></>}
        </g>
        
        <g transform={`rotate(${-heading * RAD_TO_DEG}, 16, 16)`}>
            <TickmarkTrack tickSpace={5 * DEG_TO_RAD} primaryTickPeriod={6} secondaryTickPeriod={2}/>

            {args.headingSetpoint != null ? <g stroke="#dc61f2" transform={`rotate(${args.headingSetpoint * RAD_TO_DEG}, 16, 16)`}>
                <line x1={16} y1={4} x2={16} y2={16} strokeWidth={2} strokeDasharray="8" vectorEffect="non-scaling-stroke"></line>
                <path d="M 16 4 l 0.5 0 l 0 -0.5 l -0.25 0 l -0.25 0.35 l -0.25 -0.37 l -0.25 0 l 0 0.5 z" strokeWidth={2} vectorEffect="non-scaling-stroke"></path>
            </g> : <></>}
            
            <g clipPath="url(#nav-track-clip)">
                {args.waypoints != null ? 
                    args.waypoints.map((waypoint, i) => {
                        
                        const bearing = SphericalNavigation.getForwardAzimuthBetween(args.location, waypoint.location);
                        const distance = SphericalNavigation.getDistanceBetween(args.location, waypoint.location);

                        return (<g key={i} transform={`rotate(${bearing * RAD_TO_DEG}, 16, 16) translate(16 ${16 - 12 * distance / args.viewportSize}) rotate(${(heading - bearing) * RAD_TO_DEG})`}>
                            <WaypointMarker/>
                            {(waypoint.label != null ? <text x={0.7} y={0.7} fontSize={0.6} stroke="none" fill="#ffffff">{waypoint.label}</text> : <></>)}
                        </g>)
                    }) 
                : <></>}
                
            </g>
        </g>
        
        <text x={16} y={2.0} fontSize={1} textAnchor="middle" dominantBaseline="middle" fill="#ffffff" stroke="none">{nearestDegree(heading)}°</text>
        <rect x={14.5} y={1.2} width={3} height={1.5} strokeWidth={2} vectorEffect="non-scaling-stroke"></rect>
        <path d="M 16 3.5 l 0.25 -0.5 l -0.5 0 z" strokeWidth={2} vectorEffect="non-scaling-stroke"></path>
        <line x1={16} y1={4} x2={16} y2={15.5} strokeWidth={1.5} vectorEffect="non-scaling-stroke"></line>

        <path d="M 16 16 l 0.2 0.4 l -0.4 0 z" strokeWidth={1.5} vectorEffect="non-scaling-stroke"></path>
    </svg>)

}



