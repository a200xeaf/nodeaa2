import {useNodeStore} from "../../engine/store.ts";
import React, {ChangeEvent, useEffect, useState} from "react";
import {Input, NoteMessageEvent, WebMidi} from "webmidi";
import {MIDIEvent} from "@rnbo/js";
import {context} from "../../engine/audio.ts";
import {Handle, Node, NodeProps, Position} from "@xyflow/react";
import {useShallow} from "zustand/react/shallow";

type MidiInNodeData = {
    midiin_device: string;
};

type MidiInNodeType = Node<MidiInNodeData, 'midiInNode'>;

const MidiInNode: React.FC<NodeProps<MidiInNodeType>> = ({ id }) => {
    const [inputNames, setInputNames] = useState<string[]>([]);
    const [selectedName, setSelectedName] = useState<string>("");
    const [selectedMidi, setSelectedMidi] = useState<Input | null>(null);

    const updateNode = useNodeStore(useShallow((state) => state.updateNode));
    const wm = useNodeStore(useShallow((state) => state.wm));

    const handleMidi = async () => {
        try {
            await wm.enable()
            const inputs = wm.inputs
            const inputNames: string[] = []
            inputs.forEach(input => (
                inputNames.push(input.name)
            ))
            console.log(inputNames)
            setInputNames(inputNames)
        } catch (e) {
            console.log("failed to get midi ", e)
        }

    }

    const handleMidiSelect = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedName(e.target.value)
        updateNode(id, { midiin_device: e.target.value })
    }

    // Handle adding/removing MIDI listeners
    useEffect(() => {
        if (selectedName === "" || selectedName === null) {
            // No input selected, remove any existing listeners and reset state
            if (selectedMidi) {
                selectedMidi.removeListener();
                setSelectedMidi(null);
            }
            return;
        }

        const currInput = WebMidi.getInputByName(selectedName);

        if (currInput) {
            // Set the new MIDI input and add listeners for "noteon" and "noteoff"
            setSelectedMidi(currInput);

            currInput.addListener("noteon", "all", (e: NoteMessageEvent) => {
                console.log(currInput.name)
                // console.log("Note On:", e.note.number); // Logs the MIDI note number for note on events
                const midiInfo = e.data
                const noteOnEvent = new MIDIEvent(context.currentTime, 0, midiInfo)
            });

            currInput.addListener("noteoff", "all", (e: NoteMessageEvent) => {
                console.log(currInput.name)
                // console.log("Note Off:", e.note.number); // Logs the MIDI note number for note off events
                const midiInfo = e.data
                const noteOffEvent = new MIDIEvent(context.currentTime, 0, midiInfo)
            });
        }

        // Cleanup: remove listener when the component unmounts or input changes
        return () => {
            if (selectedMidi) {
                selectedMidi.removeListener();
            }
        };
    }, [selectedName, selectedMidi]);

    return (

        <div className='w-60 h-52 drop-shadow-lg'>
            <div className='flex items-center bg-blue-200 h-[2rem] px-1'>
                <p className='font-bold text-white'>Oscillator Node</p>
            </div>
            <div className='flex flex-col nodrag cursor-default bg-white p-2 h-[11rem]'>
                <button onClick={handleMidi}>Check Midi</button>
                <select onChange={handleMidiSelect}>
                    {inputNames.length > 0 && <option value="">None</option>}
                    {inputNames.length > 0 ? (
                        inputNames.map((input, index) => (
                            <option key={index} value={input}>{input}</option>
                        ))) : <option value={""}>No Midi Inputs Detected</option>
                    }
                </select>
            </div>
            <Handle type="source" position={Position.Bottom} id='midi'/>
        </div>
    )
}
export default MidiInNode
