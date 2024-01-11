import { ReactElement, createContext, useContext } from "react";






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



interface RobotTelemetryData {
    drive: {
        
    },
    automony: {

    },
    science: {

    },
    system: {
        ping: 10
    },

};

interface RobotServerData {
    drive: {
        
    },
    automony: {
        waypoints: Waypoint[],
    },
    science: {

    },
    system: {
        ping: 10
    },
};








// export const RobotContext = createContext();

export function RobotContextProvider({ children } : { children : ReactElement[] }) {



    return children;
}