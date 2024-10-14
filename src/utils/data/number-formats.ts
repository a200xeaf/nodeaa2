const fixedMax = (x: number, max: number): string => {
    let final: string
    const length: number = Math.floor(Math.abs(x)).toString().length

    if (length <= (max - 1)) {
        final = x.toFixed(max - length)
    } else {
        final = Math.floor(x).toString()
    }

    return final
}

export const dbFormat = (x: number): string => {
    if (x <= -70) {
        return "-inf dB"
    }

    const final: string = fixedMax(x, 2)

    return final + " dB"
}

export const amountFormat = (x: number): string => {
    const final: string = fixedMax(x, 3)
    return final + "%"
}

export const timeFormat = (x: number): string => {
    const seconds: boolean = Math.abs(x) >= 1000
    let final: string
    if (seconds) {
        final = fixedMax(x / 1000, 3)
    } else {
        final = fixedMax(x, 3)
    }
    return final + (seconds ? " s" : "ms")
}

export const frequencyFormat = (x: number): string => {
    const kilo: boolean = Math.abs(x) >= 1000
    let final: string
    if (kilo) {
        final = fixedMax(x / 1000, 3)
    } else {
        final = fixedMax(x, 3)
    }
    return final + (kilo ? " kHz" : " Hz")
}

export const panFormat = (x: number): string => {
    if (x === 0) {
        return "C"
    }

    const final: string = Math.floor(Math.abs(x)).toString()
    return final + (x > 0 ? "R" : "L")
}