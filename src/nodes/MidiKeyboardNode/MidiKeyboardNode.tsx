import React, { useEffect, useState } from "react";
import {midiKeyMap, noteNames, octaveKeyMap, velocityKeyMap} from "@/nodes/MidiKeyboardNode/MidiTypes.ts";
import {Handle, Node, NodeProps, Position} from "@xyflow/react";
import {useNodeStore} from "@/engine/store.ts";
import {useShallow} from "zustand/react/shallow";
import {mainemitter} from "@/engine/utils/eventbus.ts";
import NodeaaContainer from "@/ui/nodes-ui/NodeaaContainer.tsx";
import NodeaaHeader from "@/ui/nodes-ui/NodeaaHeader.tsx";

type MidiKeyboardNodeData = {
    midikeyboard_octave: number;
    midikeyboard_velocity: number;
    midikeyboard_active: boolean;
};

type MidiKeyboardNodeType = Node<MidiKeyboardNodeData, 'midiKeyboardNode'>;

const MidiKeyboardNode: React.FC<NodeProps<MidiKeyboardNodeType>> = ({id, data, selected}) => {
    const [pressedKeys, setPressedKeys] = useState(new Set<string>());
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

    const handleActive = () => {
        updateNode(id, { midikeyboard_active: !data.midikeyboard_active });
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!data.midikeyboard_active) {
                return
            } else {
                e.stopImmediatePropagation()
            }
            if (!pressedKeys.has(e.key) && midiKeyMap.has(e.key)) {
                const midiNote = midiKeyMap.get(e.key)
                if (midiNote !== undefined) {
                    console.log("MIDI Note Pressed:", midiNote + data.midikeyboard_octave, "at velocity", data.midikeyboard_velocity)
                    const midiMessage: Uint8Array = new Uint8Array([144, midiNote + data.midikeyboard_octave, data.midikeyboard_velocity]);
                    mainemitter.emit(id + ":" + "main_midi", midiMessage);
                    setLastKey([midiNote + data.midikeyboard_octave, data.midikeyboard_velocity])
                    setPressedKeys((prev) => new Set(prev).add(e.key))
                }
            }
            if (octaveKeyMap.has(e.key)) {
                const octaveChange = octaveKeyMap.get(e.key)
                if (octaveChange !== undefined) {
                    const newOctave = Math.max(Math.min((data.midikeyboard_octave + octaveChange), 48), -48)
                    console.log("Octave is now", newOctave)
                    updateNode(id, {midikeyboard_octave: newOctave})
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
                    console.log("Velocity is now", newVelocity)
                    updateNode(id, {midikeyboard_velocity: newVelocity})
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (pressedKeys.has(e.key) && midiKeyMap.has(e.key)) {
                const midiNote = midiKeyMap.get(e.key)
                if (midiNote !== undefined) {
                    console.log("MIDI Note Released:", midiNote + data.midikeyboard_octave);
                    const midiMessage: Uint8Array = new Uint8Array([128, midiNote + data.midikeyboard_octave, 0]);
                    mainemitter.emit(id + ":" + "main_midi", midiMessage);
                    setPressedKeys((prev) => {
                        const updatedKeys = new Set(prev);
                        updatedKeys.delete(e.key);
                        return updatedKeys;
                    });
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
        };
    }, [pressedKeys, midiKeyMap, data]);

    return (
        <NodeaaContainer selected={selected} width={20} height={8}>
            <NodeaaHeader nodeName='Midi Keyboard' headerColor='bg-blue-500' />
            <div className='flex flex-col nodrag cursor-default bg-white p-2 h-[6rem] rounded-b-xl'>
                <div className='flex justify-center'>
                    <button
                        onClick={handleActive}
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
            </div>
            <Handle type="source" position={Position.Bottom} id='midi-main_midi' style={{ backgroundColor: 'rgb(59, 130, 246)' }}/>
        </NodeaaContainer>
    );
};

export default React.memo(MidiKeyboardNode);