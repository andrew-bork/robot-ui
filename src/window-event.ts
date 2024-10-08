"use client"

import { useEffect } from "react"


export function useWindowEvent(eventType : string, callback: EventListenerOrEventListenerObject) {
    useEffect(() => {
        window.addEventListener(eventType, callback);
        return () => {
            window.removeEventListener(eventType, callback);
        }
    }, [eventType, callback]);
}