import { useCallback, useState } from "react";

export function useRequest() : [ boolean, (url: string | URL | Request, init?: RequestInit) => Promise<Response>] {
    const [ isRequesting, setIsRequesting ] = useState<boolean>(false);

    const initiateRequest = useCallback((url: string | URL | Request, init?: RequestInit) : Promise<Response> => {
        if(!isRequesting) {
            setIsRequesting(true);
            return fetch(url, init)
                .finally(() => {
                    setIsRequesting(false);
                });
        }
        const emptyPromise = {
            then() { return emptyPromise; },
            catch() { return emptyPromise; },
            finally() { return emptyPromise; },
        };
        return emptyPromise as Promise<Response>;
    }, [isRequesting]);

    return [ 
        isRequesting, 
        initiateRequest
    ];
}