export const midiKeyMap = new Map([
    // White keys (A-L row)
    ['a', 48], // C3 (One octave down from Middle C)
    ['s', 50], // D3
    ['d', 52], // E3
    ['f', 53], // F3
    ['g', 55], // G3
    ['h', 57], // A3
    ['j', 59], // B3
    ['k', 60], // C4 (Middle C)
    ['l', 62], // D4

    // Black keys (Q-P row)
    ['w', 49], // C#3
    ['e', 51], // D#3
    ['t', 54], // F#3
    ['y', 56], // G#3
    ['u', 58], // A#3
]);

export const octaveKeyMap = new Map([
    ['z', -12],
    ['x', 12],
]);

export const velocityKeyMap = new Map([
    ['c', -10],
    ['v', 10],
]);

export const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];