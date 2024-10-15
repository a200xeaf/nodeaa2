export const scaleExp = (
    value: number,
    inLow: number,
    inHigh: number,
    outLow: number,
    outHigh: number,
    exp: number = 1,
    reverse: boolean = false
): number => {
    const inRange = inHigh - inLow;
    const outRange = outHigh - outLow;
    const normalizedValue = (value - inLow) / inRange;

    if (reverse) {
        // Reverse operation: scale back from output range to input range
        const normalizedOutValue = (value - outLow) / outRange;
        if (normalizedOutValue === 0) return inLow;
        if (normalizedOutValue > 0) {
            return inLow + inRange * Math.pow(normalizedOutValue, 1 / exp);
        }
        return inLow - inRange * Math.pow(-normalizedOutValue, 1 / exp);
    }

    if (normalizedValue === 0) return outLow;
    if (normalizedValue > 0) {
        return outLow + outRange * Math.pow(normalizedValue, exp);
    }
    return outLow - outRange * Math.pow(-normalizedValue, exp);
};