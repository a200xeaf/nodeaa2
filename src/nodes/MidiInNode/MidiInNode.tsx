import {useNodeStore} from "../../engine/store.ts";
import React, {ChangeEvent, useEffect, useState} from "react";
import {Input, NoteMessageEvent, WebMidi} from "webmidi";
import {Handle, Node, NodeProps, Position} from "@xyflow/react";
import {useShallow} from "zustand/react/shallow";
import {mainemitter} from "../../engine/utils/eventbus.ts";

type MidiInNodeData = {
    midiin_device: string;
};

type MidiInNodeType = Node<MidiInNodeData, 'midiInNode'>;

const MidiInNode: React.FC<NodeProps<MidiInNodeType>> = ({ id, selected }) => {
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
            console.log("hello")

            currInput.addListener("noteon", "all", (e: NoteMessageEvent) => {
                // console.log("Note On:", e.note.number); // Logs the MIDI note number for note on events
                const midiInfo = e.data
                console.log(midiInfo)
                mainemitter.emit(id + ":" + "main_midi", midiInfo);
            });

            currInput.addListener("noteoff", "all",(e: NoteMessageEvent) => {
                // console.log("Note Off:", e.note.number); // Logs the MIDI note number for note off events
                const midiInfo = e.data
                console.log(midiInfo)
                mainemitter.emit(id + ":" + "main_midi", midiInfo);
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

        <div className='w-60 h-[7rem] drop-shadow-lg'
             style={{
                 boxShadow: selected
                     ? '0 0 5px 2px rgba(59, 130, 246, 0.5)'  // Thicker shadow with lower opacity
                     : 'none',  // No shadow if not selected
             }}
        >
            <div className='flex items-center bg-blue-500 h-[2rem] px-1'>
                <p className='font-bold text-white'>Midi In</p>
            </div>
            <div className='flex flex-col nodrag cursor-default bg-white p-2 h-[5rem]'>
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
            <Handle type="source" position={Position.Bottom} id='midi-main_midi' style={{ backgroundColor: 'rgb(59, 130, 246)' }}/>
        </div>
    )
}
export default MidiInNode
