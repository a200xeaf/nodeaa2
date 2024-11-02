export interface InfoObject {
    name: string;
    parent: string | null;
    type: string;
    description: string;
}

export const infoMap = new Map<string, InfoObject>([
    // Delay Node
    ["faustDelayNode", {
        name: "Delay",
        parent: null,
        type: "Effects",
        description: "Processes the input sound to add echo effects by repeating the audio at adjustable time intervals."
    }],
    // Delay Node - Duration Control
    ["faustDelayNode-duration", {
        name: "Duration",
        parent: "Delay",
        type: "Effects",
        description: "Controls the delay time between the original sound and each echo. Higher values create longer intervals between echoes."
    }],

    // Delay Node - Feedback Control
    ["faustDelayNode-feedback", {
        name: "Feedback",
        parent: "Delay",
        type: "Effects",
        description: "Adjusts the echo repetitions. Higher feedback creates more echo layers, while lower values produce fewer repeats."
    }],

    // Delay Node - Dry/Wet Control
    ["faustDelayNode-wet", {
        name: "Dry/Wet",
        parent: "Delay",
        type: "Effects",
        description: "Balances the original (dry) sound with the delayed (wet) signal. Increase for more echo, decrease for the cleaner original sound."
    }],
]);