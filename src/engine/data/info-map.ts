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

    // Lowpass Filter Node
    ["faustLPFNode", {
        name: "Lowpass Filter",
        parent: null,
        type: "Effects",
        description: "Processes audio by removing high frequencies, allowing only frequencies below a certain threshold to pass through."
    }],
    // Lowpass Filter - Frequency Control
    ["faustLPFNode-frequency", {
        name: "Frequency",
        parent: "Lowpass Filter",
        type: "Effects",
        description: "Sets the cutoff frequency of the lowpass filter. Frequencies above this value are attenuated, allowing only lower frequencies to pass."
    }],
    // Lowpass Filter - Quality Control
    ["faustLPFNode-quality", {
        name: "Quality",
        parent: "Lowpass Filter",
        type: "Effects",
        description: "Adjusts the resonance of the filter at the cutoff frequency. Higher values create a sharper, more pronounced effect."
    }],

    // Gain Node
    ["faustGainNode", {
        name: "Gain",
        parent: null,
        type: "Effects",
        description: "Controls the volume of the audio signal. Use this to make the sound louder or quieter before it goes to other effects or the output."
    }],
    // Gain Node - Gain Control
    ["faustGainNode-gain", {
        name: "Gain",
        parent: "Gain",
        type: "Effects",
        description: "Sets how loud or soft the audio is. Moving this control up increases the volume, while moving it down lowers it. The volume change is measured in decibels (dB)."
    }],

    // Midi In Node
    ["midiInNode", {
        name: "MIDI In",
        parent: null,
        type: "MIDI",
        description: "Provides MIDI input from an external connected MIDI device. Make sure you allow your browser to access MIDI devices."
    }],
    ["midiInNode-check", {
        name: "Check Midi",
        parent: "MIDI In",
        type: "MIDI",
        description: "Checks for connected MIDI devices. Requires browser permission to work."
    }],
    ["midiInNode-list", {
        name: "Midi List",
        parent: "MIDI In",
        type: "MIDI",
        description: "Lists all detected MIDI devices. Press \"Check Midi\" to refresh the list. Select a device to connect it."
    }],

    // Midi Keyboard Node
    ["midiKeyboardNode", {
        name: "MIDI Keyboard",
        parent: null,
        type: "MIDI",
        description: "Allows the computer keyboard to be used as a MIDI keyboard. The \"A\" row represents white keys starting at C and the \"Q\" row is black keys."
    }],
    // Midi Keyboard Node
    ["midiKeyboardNode-active", {
        name: "MIDI Keyboard",
        parent: null,
        type: "MIDI",
        description: "Enables and disables the use of the keyboard as a MIDI keyboard. Note when enabled the \"Q\" and \"A\" row keys' normal functions may be bypassed."
    }],
]);