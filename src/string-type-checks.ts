

export function isHexByte(s : string, n: number = 2) {
    return /^0x[\dA-Fa-f]+$/.test(s) && (s.length - 2) <= n;
}

export function isDecimalByte(s : string, n: number = 3) {
    return /^[\d]+$/.test(s) && s.length <= n;
}

export function isBinaryByte(s : string, n: number = 8) {
    // return /^0b[0,1]{1,8}$/.test(s);
    return /^0b[0,1]+$/.test(s) && (s.length - 2) <= n;
}

export function isInprogress(s : string) {
    return s.length === 0 || s === "0x" || s === "0b";
}


export function byteToNumber(s : string, fallback : number = NaN) {
    if(isHexByte(s)) {
        return parseInt(s, 16);
    } else if(isBinaryByte(s)) {
        return parseInt(s.slice(2), 2);
    }else if(isDecimalByte(s)) {
        return parseInt(s, 10);
    }
    return fallback;
}
