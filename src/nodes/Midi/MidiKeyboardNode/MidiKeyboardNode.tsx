import React, {memo, useEffect, useState} from "react";
import {midiKeyMap, octaveKeyMap, velocityKeyMap} from "@/nodes/Midi/MidiKeyboardNode/MidiTypes.ts";
import {Handle, Node, NodeProps, Position} from "@xyflow/react";
import {useNodeStore} from "@/engine/store.ts";
import {useShallow} from "zustand/react/shallow";
import {mainemitter} from "@/engine/utils/eventbus.ts";
import NodeaaContainer from "@/ui/nodes-ui/NodeaaContainer.tsx";
import NodeaaHeader from "@/ui/nodes-ui/NodeaaHeader.tsx";
import PianoKeyboard from "@/ui/inputs/PianoKeyboard.tsx";
import {noteNames} from "@/engine/data/note-constants.ts";

type MidiKeyboardNodeData = {
    midikeyboard_octave: number;
    midikeyboard_velocity: number;
    midikeyboard_active: boolean;
};

type MidiKeyboardNodeType = Node<MidiKeyboardNodeData, 'midiKeyboardNode'>;

const MidiKeyboardNode: React.FC<NodeProps<MidiKeyboardNodeType>> = ({id, data, selected}) => {
    const [pressedKeys, setPressedKeys] = useState(new Set<string>());
    const [pressedMidiNotes, setPressedMidiNotes] = useState<number[]>([]);
    const [lastKey, setLastKey] = useState<[number | undefined, number | undefined]>([undefined, undefined]);
    const updateNode = useNodeStore(useShallow((state) => state.updateNode));

    const midiNumberToNote = (midiNumber: number | undefined): string => {
        if (midiNumber === undefined) {
            return "Nothing"
        }
        const noteFinal = noteNames[midiNumber % 12]; // Get the note name (C, C#, etc.)
        const octaveFinal = Math.floor(midiNumber / 12) - 1; // Calculate the octave
        return `${noteFinal}${octaveFinal}`; // Return the note name with octave
    }

    const toggleActive = () => {
        const curr = !data.midikeyboard_active;
        console.log(curr)
        updateNode(id, { midikeyboard_active: !data.midikeyboard_active });
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!data.midikeyboard_active) {
                return
            }
            if (!pressedKeys.has(e.key) && midiKeyMap.has(e.key)) {
                const midiNote = midiKeyMap.get(e.key)
                if (midiNote !== undefined) {
                    // console.log("MIDI Note Pressed:", midiNote + data.midikeyboard_octave, "at velocity", data.midikeyboard_velocity)
                    const midiNoteWithOctave = midiNote + data.midikeyboard_octave;
                    const midiMessage: Uint8Array = new Uint8Array([144, midiNote + data.midikeyboard_octave, data.midikeyboard_velocity]);
                    mainemitter.emit(id + ":" + "main_midi", midiMessage);
                    setLastKey([midiNote + data.midikeyboard_octave, data.midikeyboard_velocity])
                    setPressedKeys((prev) => new Set(prev).add(e.key))
                    setPressedMidiNotes((prev) => [...prev, midiNoteWithOctave]);
                }
            }
            if (octaveKeyMap.has(e.key)) {
                const octaveChange = octaveKeyMap.get(e.key);
                if (octaveChange !== undefined) {
                    const newOctave = Math.max(Math.min((data.midikeyboard_octave + octaveChange), 48), -48);

                    // Turn off currently held notes
                    pressedMidiNotes.forEach((note) => {
                        const midiMessage: Uint8Array = new Uint8Array([128, note, 0]); // MIDI "note off" message
                        mainemitter.emit(id + ":" + "main_midi", midiMessage);
                    });

                    // Clear pressed notes
                    setPressedKeys(new Set());
                    setPressedMidiNotes([]);

                    // Update the octave
                    updateNode(id, { midikeyboard_octave: newOctave });
                }
            }
            if (velocityKeyMap.has(e.key)) {
                const velocityChange = velocityKeyMap.get(e.key)
                if (velocityChange !== undefined) {
                    let newVelocity: number
                    if (data.midikeyboard_velocity === 127 && e.key === 'c') {
                        newVelocity = 120
                    } else {
                        newVelocity = Math.max(Math.min((data.midikeyboard_velocity + velocityChange), 127), 0)
                    }
                    // console.log("Velocity is now", newVelocity)
                    updateNode(id, {midikeyboard_velocity: newVelocity})
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (pressedKeys.has(e.key) && midiKeyMap.has(e.key)) {
                const midiNote = midiKeyMap.get(e.key)
                if (midiNote !== undefined) {
                    // console.log("MIDI Note Released:", midiNote + data.midikeyboard_octave);
                    const midiNoteWithOctave = midiNote + data.midikeyboard_octave;
                    const midiMessage: Uint8Array = new Uint8Array([128, midiNote + data.midikeyboard_octave, 0]);
                    mainemitter.emit(id + ":" + "main_midi", midiMessage);
                    setPressedKeys((prev) => {
                        const updatedKeys = new Set(prev);
                        updatedKeys.delete(e.key);
                        return updatedKeys;
                    });
                    setPressedMidiNotes((prev) => prev.filter(note => note !== midiNoteWithOctave));
                }
            }
        };

        mainemitter.on("keydownarmed", handleKeyDown);
        mainemitter.on("keyuparmed", handleKeyUp);
        return () => {
            mainemitter.off("keydownarmed", handleKeyDown);
            mainemitter.off("keyuparmed", handleKeyUp);
        };
    }, [pressedKeys, midiKeyMap, data]);

    useEffect(() => {
        return () => {
            useNodeStore.getState().removeArmed(id)
        }
    }, []);

    useEffect(() => {
        if (data.midikeyboard_active) {
            useNodeStore.getState().addArmed(id, true)
            console.log(useNodeStore.getState().currentlyArmed.size)
        } else {
            useNodeStore.getState().removeArmed(id)
        }
    }, [data, id]);

    return (
        <NodeaaContainer selected={selected} width={23} height={12} infoID='midiKeyboardNode'>
            <NodeaaHeader nodeName='MIDI Keyboard' headerColor='bg-blue-500' />
            <div className='flex flex-col nodrag cursor-default bg-white p-2 h-[10rem] rounded-b-xl'>
                <div className='flex justify-center'>
                    <button
                        onClick={() => toggleActive()}
                        data-info-panel-id="midiKeyboardNode-active"
                        className={`font-bold text-center p-1 text-sm w-40 ${data.midikeyboard_active ? 'bg-green-500' : 'bg-red-500'}`}>
                        {data.midikeyboard_active ? (
                            <span className='text-white'>On</span>
                        ) : (
                            <span className='text-black'>Off</span>
                        )}
                    </button>
                </div>
                <p>Last key: {midiNumberToNote(lastKey[0])} with
                    velocity {lastKey[1] === undefined ? "nothing" : lastKey[1]}</p>
                <p>Octave: {data.midikeyboard_octave >= 0 ? `+${data.midikeyboard_octave / 12}` : `${data.midikeyboard_octave / 12}`}</p>
                <PianoKeyboard keyHeight={70} keyWidth={39} numKeys={16} startNote={48 + data.midikeyboard_octave} heldNotes={pressedMidiNotes} />
            </div>
            <Handle type="source" position={Position.Bottom} id='midi-main_midi' style={{ backgroundColor: 'rgb(59, 130, 246)' }}/>
        </NodeaaContainer>
    );
};

export default memo(MidiKeyboardNode);