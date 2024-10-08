"use client"
import { useEffect, useRef, useState } from "react";



export function ResizeFollower(props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { onSize?: (newSize:{width:number, height:number})=>void}) {

    const { children, onSize = ()=>{},  ...rest } = props;

    const [ width, setWidth ] = useState(0);
    const [ height, setHeight ] = useState(0);

    const followed = useRef<HTMLDivElement>(null!);

    useEffect(() => {
        // onResize = onResize ?? () => {};
        const observer = new ResizeObserver(() => {
            setWidth(followed.current.clientWidth);
            setHeight(followed.current.clientHeight);
            onSize({
                width: followed.current.clientWidth,
                height: followed.current.clientHeight,
            });
        });
        observer.observe(followed.current);
        return () => {
            observer.disconnect();
        }
    }, [onSize]);

    return <div {...rest} ref={followed}>
        <div style={{
            position:`absolute`,
            left: `0`,
            top: `0`,
            width: `${width}px`,
            height: `${height}px`
        }}>
            {children}
        </div>
    </div>
}
