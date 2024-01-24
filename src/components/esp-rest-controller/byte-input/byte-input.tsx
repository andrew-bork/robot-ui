import { FocusEventHandler, useRef } from "react";
import styles from "./byte-input.module.css";
import { isBinaryByte, isDecimalByte, isHexByte, isInprogress } from "@/string-type-checks";

function goToPrevInput(next : Element | null) { 
    if (next == null)
        return;
    while (next = next.previousElementSibling) {
        if (next == null)
            break;
        if (next.tagName.toLowerCase() === "input") {
            (next as HTMLInputElement).focus();
            (next as HTMLInputElement).value = (next as HTMLInputElement).value;
            break;
        }
    }
}
function goToNextInput(next : Element | null) {
    if (next == null)
        return;
    while (next = next.nextElementSibling) {
        if (next == null)
            return false;
        if (next.tagName.toLowerCase() === "input") {
            (next as HTMLInputElement).focus();
            (next as HTMLInputElement).value = (next as HTMLInputElement).value;
            return true;
        }
    }
    return false;
}


interface ByteInputArgs {
    tabIndex?: number,
    className?: string,
    value: string,
    onChange: (s: string) => void,
    onFocus?: FocusEventHandler<HTMLInputElement>,
    onBlur?: FocusEventHandler<HTMLInputElement>,
    autoFocus?: boolean,
    byteCount?: number
}

export function ByteInput({ tabIndex=0, className="", value, onChange, onFocus=()=>{}, onBlur=()=>{}, autoFocus = false, byteCount=1 } : ByteInputArgs) {
    const spanRef = useRef<HTMLSpanElement>(null!);
    // const inputRef = useRef<HTML
    const decimalDigits = Math.floor(Math.log10(Math.pow(2, 8 * byteCount) - 1)) + 1;
    return <>
        <input autoFocus={autoFocus} contentEditable={true} className={styles["byte-input"] + " " + className} 
        style={{
            minWidth: `${(2 + byteCount) * 1.15}em`,
            width: spanRef.current?.offsetWidth ?? `${(2 + byteCount) * 1.15}em`,
        }}
        onKeyDown={(e) => {
            if(e.key === "Backspace") {
                if(value.length === 0) {
                    goToPrevInput(e.target as Element);
                }
            }else if(e.key === " ") {
                if(goToNextInput(e.target as Element)) {
                    
                    e.preventDefault();
                }
            }
        }}
        tabIndex={tabIndex}
        onBlur={onBlur}
        onFocus={onFocus}
        onChange={(e) => {
            const newValue = e.target.value;
            const noSpaces = e.target.value.replace(" ", "");
            
            if(isHexByte(noSpaces, byteCount * 2)) {
                if(noSpaces.length === 2 * byteCount * 2) {
                    goToNextInput(e.target);
                }
            }else if(isBinaryByte(noSpaces, byteCount * 8)) {
                if(noSpaces.length === 2 + byteCount * 8) {
                    goToNextInput(e.target);
                }
            }else if(isDecimalByte(noSpaces, decimalDigits)) {
                if(noSpaces.length === decimalDigits) {
                    goToNextInput(e.target);
                }
            }else if(isInprogress(noSpaces)) {
                
            }else {
                return;
            }

            onChange(newValue);
            spanRef.current.innerText = e.target.value;
            e.target.style.width = Math.max(54, spanRef.current.offsetWidth) + "px";
        }} value={value} />
        
        <span style={{padding: "10px", left: "-9999px", position: "absolute", fontFamily: "monospace"}} ref={spanRef}></span>
    </>
}
