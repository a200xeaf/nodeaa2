import { useState } from "react";

type MidiNoteTracker = {
    activeNotes: Set<number>; // Tracks currently active MIDI notes
    handleMidiEvent: (midiEvent: Uint8Array) => void; // Function to process MIDI events
};

const useMidiNoteTracker = (): MidiNoteTracker => {
    const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());

    // Function to handle incoming MIDI events
    const handleMidiEvent = (midiEvent: Uint8Array) => {
        const [status, note, velocity] = midiEvent;

        // Determine if the event is a Note On or Note Off
        const isNoteOn = status === 144 && velocity > 0;
        const isNoteOff = status === 128 || (status === 144 && velocity === 0);

        if (isNoteOn) {
            setActiveNotes((prev) => new Set(prev).add(note));
        } else if (isNoteOff) {
            setActiveNotes((prev) => {
                const updatedNotes = new Set(prev);
                updatedNotes.delete(note);
                return updatedNotes;
            });
        }
    };

    return {
        activeNotes,
        handleMidiEvent,
    };
};

export default useMidiNoteTracker;