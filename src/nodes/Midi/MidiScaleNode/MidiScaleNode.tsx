import NodeaaContainer from "@/ui/nodes-ui/NodeaaContainer.tsx";
import NodeaaHeader from "@/ui/nodes-ui/NodeaaHeader.tsx";
import {Handle, Node, NodeProps, Position, useHandleConnections} from "@xyflow/react";
import {ChangeEvent, FC, memo, useCallback, useEffect, useRef} from "react";
import {useEmitterSubscriptions} from "@/engine/utils/hooks/useEmitterSubscription.ts";
import {useNodeStore} from "@/engine/store.ts";
import {useShallow} from "zustand/react/shallow";
import {mainemitter} from "@/engine/utils/eventbus.ts";

type MidiScaleNodeData = {
    midiscale_scalekey: number;
    midiscale_scaletype: string;
    midiscale_scalearray: number[];
};

type MidiScaleNodeType = Node<MidiScaleNodeData, 'midiScaleNode'>;

const MidiScaleNode: FC<NodeProps<MidiScaleNodeType>> = ({id, data, selected}) => {
    const midiConnections = useHandleConnections({type: 'target', id: 'midi'})
    const updateNode = useNodeStore(useShallow((state) => state.updateNode));
    const outputNoteToInputNote = useRef<Map<number, number>>(new Map());
    const notes = [
        { value: 0, label: 'C' },
        { value: 1, label: 'C#' },
        { value: 2, label: 'D' },
        { value: 3, label: 'D#' },
        { value: 4, label: 'E' },
        { value: 5, label: 'F' },
        { value: 6, label: 'F#' },
        { value: 7, label: 'G' },
        { value: 8, label: 'G#' },
        { value: 9, label: 'A' },
        { value: 10, label: 'A#' },
        { value: 11, label: 'B' },
    ];

    const getScaleMapping = (rootNote: number, scaleName: string): number[] => {
        // Define the intervals for major and minor scales
        const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
        const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

        // Select the appropriate scale intervals based on the scale name
        let scaleIntervals: number[];
        if (scaleName === "major") {
            scaleIntervals = MAJOR_SCALE_INTERVALS;
        } else if (scaleName === "minor") {
            scaleIntervals = MINOR_SCALE_INTERVALS;
        } else {
            throw new Error("Invalid scale name. Please use 'Major' or 'Minor'.");
        }

        // Transpose the scale intervals based on the root note
        const scaleNotes = scaleIntervals
            .map((interval) => (interval + rootNote) % 12)
            .sort((a, b) => a - b);

        const mapping: number[] = [];

        for (let note = 0; note < 12; note++) {
            if (scaleNotes.includes(note)) {
                // If the note is in the scale, map it to itself
                mapping[note] = note;
            } else {
                // Find the previous note in the scale (moving down)
                const previousNotes = scaleNotes.filter((scaleNote) => scaleNote < note);
                if (previousNotes.length > 0) {
                    mapping[note] = previousNotes[previousNotes.length - 1];
                } else {
                    // If there's no previous note (i.e., the note is lower than the first scale note), map to the first scale note
                    mapping[note] = scaleNotes[0];
                }
            }
        }

        return mapping;
    }

    const setParams = useCallback((name: string, value: string | number[]) => {
        if (name === 'type') {
            updateNode(id, { [`midiscale_scaletype`]: value})
        } else if (name === 'key') {
            updateNode(id, { [`midiscale_scalekey`]: +value})
        } else {
            updateNode(id, { [`midiscale_scalearray`]: value})
        }
    }, [id, updateNode])

    const handleScaleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setParams(e.target.id, e.target.value)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        e.preventDefault()
    }

    useEffect(() => {
        setParams("array", getScaleMapping(data.midiscale_scalekey, data.midiscale_scaletype))
    }, [data.midiscale_scalekey, data.midiscale_scaletype, setParams]);

    const handleMIDI = useCallback(
        (e: Uint8Array) => {
            const [status, inputNote, velocity] = e;
            const isNoteOn = status === 144 && velocity > 0;
            const isNoteOff = status === 128 || (status === 144 && velocity === 0);

            const octave = Math.floor(inputNote / 12) * 12;
            const outputNote = data.midiscale_scalearray[inputNote % 12] + octave;

            if (isNoteOn) {
                // Check if the output note is already active
                if (outputNoteToInputNote.current.has(outputNote)) {
                    // Send Note Off for the current output note
                    const noteOffMessage = Uint8Array.from([128, outputNote, 0]);
                    mainemitter.emit(id + ":" + "main_midi", noteOffMessage);
                    console.log(noteOffMessage);
                }
                // Send Note On for the new output note
                const noteOnMessage = Uint8Array.from([144, outputNote, velocity]);
                mainemitter.emit(id + ":" + "main_midi", noteOnMessage);
                console.log(noteOnMessage);

                // Update the mapping
                outputNoteToInputNote.current.set(outputNote, inputNote);
            } else if (isNoteOff) {
                const currentInputNote = outputNoteToInputNote.current.get(outputNote);

                if (currentInputNote === inputNote) {
                    // Send Note Off for the output note
                    const noteOffMessage = Uint8Array.from([128, outputNote, 0]);
                    mainemitter.emit(id + ":" + "main_midi", noteOffMessage);
                    console.log(noteOffMessage);

                    // Remove the mapping
                    outputNoteToInputNote.current.delete(outputNote);
                }
            }
        },
        [data.midiscale_scalearray, id]
    );

    useEmitterSubscriptions({
        connections: midiConnections,
        callback: handleMIDI,
        data
    })

    return (
        <NodeaaContainer selected={selected} width={16} height={6}>
            <Handle type="target" position={Position.Top} id='midi' style={{backgroundColor: 'rgb(59, 130, 246)'}}/>
            <NodeaaHeader nodeName='MIDI Scale' headerColor='bg-blue-500'/>
            <div className='flex flex-col justify-center items-center nodrag cursor-default bg-white p-2 h-[4rem] rounded-b-xl'>
                <div className='flex items-center'>
                    <p>Key:&nbsp;</p>
                    <select className='p-1 bg-white border-black border-2 rounded-lg' id='key' value={data.midiscale_scalekey} onChange={handleScaleChange} onKeyDown={handleKeyDown}>
                        {notes.map((noteOption) => (
                            <option key={noteOption.value} value={noteOption.value}>
                                {noteOption.label}
                            </option>
                        ))}
                    </select>
                    <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <p>Scale:&nbsp;</p>
                    <select className='p-1 bg-white border-black border-2 rounded-lg' id='type' value={data.midiscale_scaletype} onChange={handleScaleChange} onKeyDown={handleKeyDown}>
                        <option value="major">Major</option>
                        <option value="minor">Minor</option>
                    </select>
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} id='midi-main_midi'
                    style={{backgroundColor: 'rgb(59, 130, 246)'}}/>
        </NodeaaContainer>
    )
}
export default memo(MidiScaleNode)
