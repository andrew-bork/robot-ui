"use client"
import { ReactElement, createContext, useCallback, useContext, useRef, useState } from "react";






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


interface RobotSettings {

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

type ConnectionStatus = Response;
type CommandStatus = Response;

interface Robot {
    robot: RobotTelemetryData,
    settings: RobotSettings,
    // connect: () => Promise<ConnectionStatus>,
    startPolling: () => void,
    stopPolling: () => void,
    sendCommand: () => Promise<CommandStatus>,
    setSettings: (newSettings : RobotSettings) => void,
};


const defaultRobotState : RobotTelemetryData = {
    drive: {
        setpoints: {
            steering_axis_angle: NaN,
            steering_angle: NaN,
            wheel_speed: NaN,
        },
        steering_axis_angle: NaN,
        steering_angle: NaN,
        wheel_speed: NaN,
    },
    navigation: {
        air_pressure: NaN,
        altitude: NaN,
        
        gps_location: { lat: NaN, long: NaN },
        heading: NaN,

        velocity: { x: NaN, y: NaN, z: NaN },
        acceleration: { x: NaN, y: NaN, z: NaN },

        orientation: { w: NaN, x: NaN, y: NaN, z: NaN },
        angular_velocity: { w: NaN, x: NaN, y: NaN, z: NaN },
    },
    automony: {
        lidar: [],
        waypoints: [],
    },
    science: {
        co2_value: NaN,
        humidity: NaN,
        air_pressure: NaN,

    },
    system: {
        ping: NaN,
        battery: NaN,
        state: "Unconnected",
    },
}

const defaultRobotSettings : RobotSettings = {

};


const RobotContext = createContext<Robot>({
    robot: defaultRobotState,
    // settings: 
    settings: {},
    sendCommand: () => {
        console.error("Send Command not implemented.");

        return fetch("");
    },
    // connect: () => {
    //     console.error("connect not implemented.");

    //     return fetch("");
    // },
    startPolling: () => {
        console.error("startPolling not implemented.");
    },
    stopPolling: () => {
        console.error("stopPolling not implemented.");
    },
    setSettings: (_) => {
        console.error("setSettings not implemented.");
    }
});

export function useRobotSettings() {
    const { settings }  = useContext(RobotContext);
    return settings;
}

export function useRobotState() {
    const { robot } = useContext(RobotContext);
    return robot;
}

export function useRobot() {
    return useContext(RobotContext);
}

export function useDriveData() {
    const { robot } = useContext(RobotContext);
    return robot.drive;
}

export function useNavigationData() {
    const { robot } = useContext(RobotContext);
    return robot.navigation;
}

export function RobotContextProvider({ children } : { children : React.ReactNode }) {
    const [ robotState, setRobotState ] = useState<RobotTelemetryData>(defaultRobotState);
    const [ settings, setRobotSettings ] = useState<RobotSettings>(defaultRobotSettings);

    const interval = useRef<NodeJS.Timeout|null>(null);

    const settingsRef = useRef<RobotSettings>(settings);
    settingsRef.current = settings;



    const startPolling = useCallback(() => {
        const pollingInterval = 1000;
        if(interval.current == null) {
            interval.current = setInterval(() => {
    
            }, pollingInterval);
        }else {
            console.error("Tried to startPolling when already polling.");
        }
    }, []);

    const stopPolling = useCallback(() => {
        if(interval.current != null) {
            clearInterval(interval.current);
        }else {
            console.error("Tried to stopPolling when we werent polling.");
        }
    }, []);
    const sendCommand = useCallback(() => {

        return fetch("");
    }, []);

    return <RobotContext.Provider value={{
        robot: robotState,
        settings,

        startPolling,
        stopPolling,
        sendCommand,
        setSettings: setRobotSettings,
    }}>
        {children}
    </RobotContext.Provider>
}