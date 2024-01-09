import { useEffect, useRef, Fragment, useMemo } from "react";

export interface CustomRangeSliderArgs {
    value: number,
    onChange: (newValue: number) => void,

    min: number,
    max: number,

    tickScale: number,

    infinite: boolean,

    toText: (value: number) => string,
    tickAmount: number,
    primaryTickPeriod: number,
    secondaryTickPeriod: number,

    barberMin?: number,
    barberMax?: number,
    setpoint?: number,
}

export interface AngleSliderArgs {
    value: number,
    onChange: (newValue: number) => void,

    min?: number,
    max?: number,

    tickScale?: number,

    infinite?: boolean,

    toText?: ((value: number) => string),
    tickAmount?: number,
    primaryTickPeriod?: number,
    secondaryTickPeriod?: number,

    barberMin?: number,
    barberMax?: number,
    setpoint?: number,
}

export function AngleRangeSlider({ 
    value, 
    onChange, 
    min = -180, 
    max = 180, 
    infinite = false, 
    toText = (value) => value.toFixed(1)+"°", 
    tickScale = 0.5, 
    tickAmount = 10, 
    primaryTickPeriod = 9, 
    secondaryTickPeriod = 3,
    barberMin,
    barberMax,
    setpoint,
} : AngleSliderArgs) {
    
    return <CustomRangeSlider 
        value={value} onChange={onChange}
        min={min} max={max}
        infinite={infinite}
        toText={toText}
        tickScale={tickScale}
        tickAmount={tickAmount}
        primaryTickPeriod={primaryTickPeriod}
        secondaryTickPeriod={secondaryTickPeriod}
        barberMin={barberMin}
        barberMax={barberMax}
        setpoint={setpoint}
        />
}



function TickmarkTrack({ min, max, tickDistance, tickScale, primaryTickPeriod, secondaryTickPeriod, infinite, toText } : { min : number, max : number, tickScale : number, tickDistance : number, primaryTickPeriod : number, secondaryTickPeriod : number, infinite : boolean, toText : (x:number)=>string } ) {

    // Generate the tickmarks.
    const tickmarks = useMemo(() => {
        const tickmarks = [];

        for(let i = 0; (i * tickDistance + min) <= max; i ++) {
            let length = 1;
            let hasText = false;
            let tickPosition = (i * tickDistance + min) * tickScale;
            if(i % primaryTickPeriod === 0) {
                length = 8;
                hasText = true;
            }
            else if(i % secondaryTickPeriod === 0) {
                length = 4;
                hasText = true;
            }
            tickmarks.push({ value: i * tickDistance + min, length, hasText, tickPosition });
        }
    
        if(infinite){
            // This is the extra tick marks for inifinite sliders.
    
            for(let i = 0; (i * tickDistance + min) < max; i ++) {
                let length = 1;
                let hasText = false;
                let tickPosition = (i * tickDistance + min - (max - min)) * tickScale;
                if(i % primaryTickPeriod === 0) {
                    length = 8;
                    hasText = true;
                }
                else if(i % secondaryTickPeriod === 0) {
                    length = 4;
                    hasText = true;
                }
                tickmarks.push({ value: i * tickDistance + min, length, hasText, tickPosition });
            }
    
            for(let i = 1; (i * tickDistance + min) <= max; i ++) {
                let length = 1;
                let hasText = false;
                let tickPosition = (i * tickDistance + max) * tickScale;
                if(i % primaryTickPeriod === 0) {
                    length = 8;
                    hasText = true;
                }
                else if(i % secondaryTickPeriod === 0) {
                    length = 4;
                    hasText = true;
                }
                tickmarks.push({ value: i * tickDistance + min, length, hasText, tickPosition });
            }
        }

        return tickmarks;
    }, [min, max, tickDistance, tickScale, primaryTickPeriod, secondaryTickPeriod, infinite]);
    return tickmarks.map((tick, i) => {
        return <Fragment key={i}>
            <line x1={tick.tickPosition + 48} x2={tick.tickPosition + 48} y1={4} y2={4 + tick.length} stroke='#ffffff' strokeWidth={2} vectorEffect="non-scaling-stroke"></line>
            {(tick.hasText ? <text x={tick.tickPosition + 48} y={5+tick.length} fontSize={3} textAnchor="middle" dominantBaseline="hanging" stroke="none" fill="#ffffff" style={{userSelect: "none"}}>{toText(tick.value)}</text> : <></>)}
        </Fragment>
    })

}

export function CustomRangeSlider({ value, onChange, min, max, infinite, toText, tickScale, tickAmount, primaryTickPeriod=90, secondaryTickPeriod=30, barberMin, barberMax, setpoint } : CustomRangeSliderArgs ) {

    const svg = useRef<SVGSVGElement|null>(null);
    const isMouseDown = useRef(false);
    const mouseButton = useRef(0);
    const isMouseOver = useRef(false);

    // Move Value ref. This is to propagate the onChange state to the window events.
    
    // Change the value by value dx.
    const moveValue = useRef((dx : number)=>{
        let newValue = (value + dx / tickScale);
        if(infinite) {
            if(newValue > max) newValue -= (max - min);
            else if(newValue < min) newValue += (max - min);
        }else {
            newValue = Math.min(max, Math.max(min, newValue));
        }
        onChange(newValue);
    });

    // Sync the changes with the ref.
    moveValue.current = (dx : number)=>{
        let newValue = (value + dx / tickScale) ;
        if(infinite) {
            if(newValue > max) newValue -= (max - min);
            else if(newValue < min) newValue += (max - min);
        }else {
            newValue = Math.min(max, Math.max(min, newValue));
        }
        onChange(newValue);
    };


    // Attach Window Listeners
    useEffect(() => {
        window.addEventListener("mousemove", (e) => {
            if(isMouseDown.current) {
                if(svg.current != null) {
                    const rect = svg.current.getBoundingClientRect();
                    if(mouseButton.current === 0) {
                        moveValue.current(-(96 * e.movementX / rect.width));
                    }else {
                        moveValue.current(-(e.movementX / rect.width));
                    }
                }
            }
        });

        window.addEventListener("mouseup", (e) => {
            if(isMouseDown.current) {
                isMouseDown.current = false;
            }
        });
        
        window.addEventListener("wheel", (e) => {
            if(isMouseOver.current) {
                // let dy = 1;
                // if(e.deltaY < 0) dy = -1;
                moveValue.current(e.deltaY * 0.01);
            }
        });
    }, [])

    return <svg version="1.1" viewBox="0 -8 96 24" xmlns="http://www.w3.org/2000/svg"
        onContextMenu={(e) => e.preventDefault()}
        ref={svg}
    >
        <rect x={0} y={4} width={96} height={20} stroke="none" fill="#00000033"></rect>
        
        <text x={48} y={-2} fontSize={4} textAnchor="middle" dominantBaseline="text-bottom" stroke="none" fill="#ffffff" style={{userSelect: "none"}}>{toText(value)}</text>
        <line x1={48} y={0} x2={48} y2={3} stroke='#ffffff' strokeWidth={2} vectorEffect="non-scaling-stroke"></line>
        
        <g transform={`translate(${-value * tickScale}, 0)`}>
            {(setpoint != null ? 
                <path d={`M ${48 + setpoint * tickScale-1} ${0} l ${2} ${0} l ${0} ${2} l ${-1} ${1} l ${-1} ${-1} l ${0} ${-2} z`} stroke='#b969d6' strokeWidth={1.5} vectorEffect="non-scaling-stroke" fill="none"></path> :
                <></>
            )}
            {(barberMax != null ? 
                <line x1={48 + barberMax * tickScale}  y1={3} x2={100000} y2={3} stroke='#ff0000' strokeWidth={2} vectorEffect="non-scaling-stroke" strokeDasharray="4"></line>
                : <></>)}
            {(barberMin != null ? 
                <line x1={48 + barberMin * tickScale}  y1={3} x2={-100000} y2={3} stroke='#ff0000' strokeWidth={2} vectorEffect="non-scaling-stroke" strokeDasharray="4"></line>
                : <></>)}
            <TickmarkTrack min={min} max={max} tickDistance={tickAmount} tickScale={tickScale} infinite={infinite} primaryTickPeriod={primaryTickPeriod} secondaryTickPeriod={secondaryTickPeriod} toText={toText}/>
        </g>


        <rect x={0} y={4} width={96} height={20} stroke="none" fill="#00000000" 
            style={{
                cursor: "ew-resize"
            }}
            onMouseDown={(e) => {
                isMouseDown.current = true;
                mouseButton.current = e.button;
            }}
            onMouseEnter={() => {
                isMouseOver.current = true;
            }}
            onMouseLeave={() => {
                isMouseOver.current = false;
            }}></rect>
    </svg>


}