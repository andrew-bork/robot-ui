import { ReactElement, createContext, useContext } from "react";






interface Coordinate {
    lat: number,
    long: number,
};

interface Quarternion {
    w: number,
    x: number,
    y: number, 
    z: number,
}

interface Vector3 {
    x: number,
    y: number, 
    z: number,
}

interface Polar {
    r: number,
    theta: number,
};

interface Waypoint {
    location: Coordinate,

    label?: string,
    range?: number,
    color?: string,
};



interface RobotTelemetryData {
    drive: {
        setpoints: {
            steering_axis_angle: number,
            steering_angle: number,
            wheel_speed: number,
        }

        steering_axis_angle: number,
        steering_angle: number,
        wheel_speed: number,
    },
    navigation: {
        air_pressure: number,
        altitude: number,
        
        gps_location: Coordinate,
        heading: number,

        velocity: Vector3,
        acceleration: Vector3,

        orientation: Quarternion,
        angular_velocity: Quarternion,
    },
    automony: {
        lidar: Polar[],
        waypoints: Waypoint[],
    },
    science: {
        co2_value: number,
        humidity: number,
        air_pressure: number,

    },
    system: {
        ping: number,
        battery: number,
        state: string,
    },
};

type CommandStatus = Response;

interface Robot {
    robot: RobotTelemetryData,
    sendCommand: Promise<CommandStatus>,
}


function sendCommand?() {}

const RobotContext = useContext<Robot>();

export function useRobot() {
    const {}  = 
}

export function useDriveData() {
    
}

export function useNavigationData() {

}

// export function use

// export const RobotContext = createContext();

export function RobotContextProvider({ children } : { children : ReactElement[] }) {



    return children;
}