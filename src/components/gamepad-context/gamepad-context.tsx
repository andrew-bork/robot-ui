"use client"
import { Dispatch, ReactElement, SetStateAction, createContext, useCallback, useContext, useEffect, useRef, useState } from "react";




function useWindowEvent<K extends keyof WindowEventMap>(type : K, listener: (this: Window, ev: WindowEventMap[K]) => any) {
    useEffect(() => {
        window.addEventListener(type, listener);
        return () => {
            window.removeEventListener(type, listener);
        }
    }, [type, listener]);
}

interface GamepadContextData {
    // list: Gamepad[],

    subsystemController: {
        drive: number;
        arm: number;
    };

    currentControllerMapping: {
        arm: {};
        drive: {};
    };
    changeSubsystemController: Dispatch<SetStateAction<{
        arm: number;
        drive: number;
    }>>;
};

const GamepadContext = createContext<GamepadContextData>({
    subsystemController: {
        drive: -1,
        arm: -1,
    },

    currentControllerMapping: {
        arm: {},
        drive: {},
    },

    changeSubsystemController: () => {},
    
});

export function useGamepadList() {
    const [ gamepads, setGamepads ] = useState<Gamepad[]>([]);

    useWindowEvent("gamepadconnected", (e) => {
        console.log("Captured Gamepad", e);
        setGamepads(navigator.getGamepads().filter((gamepad) => gamepad != null) as Gamepad[]);
    });
    
    useWindowEvent("gamepaddisconnected", (e) => {
        console.log("Gamepad disconnected", e);
        setGamepads(navigator.getGamepads().filter((gamepad) => gamepad !== null) as Gamepad[]);
    });

    return gamepads;
}

export function useDriveController() {
    const { subsystemController } = useContext(GamepadContext);
    return subsystemController.drive;
}

export function useArmController() {
    const { subsystemController } = useContext(GamepadContext);
    return subsystemController.arm;
}

export function useChangeSubsystemController() {
    const { changeSubsystemController } = useContext(GamepadContext);
    return changeSubsystemController;
}

// export function useRobot() {
//     return useContext(RobotContext);
// }

// export function useDriveData() {
//     const { robot } = useContext(RobotContext);
//     return robot.drive;
// }

// export function useNavigationData() {
//     const { robot } = useContext(RobotContext);
//     return robot.navigation;
// }

export function useGamepadConnect(callback : (gamepad: Gamepad) => void) {
    useWindowEvent("gamepadconnected", (e) => {
        callback(e.gamepad);
    });
}

export function GamepadContextProvider({ children } : { children : React.ReactNode }) {
    const [ subsystemController, setSubsystemController ] = useState({ arm: -1, drive: -1 });
    const [ currentControllerMapping, setCurrentControllerMapping ] = useState({ arm: {}, drive: {} });

    return <GamepadContext.Provider value={{
        subsystemController: subsystemController,
        currentControllerMapping: currentControllerMapping,

        changeSubsystemController: setSubsystemController,
    }}>
        {children}
    </GamepadContext.Provider>
}