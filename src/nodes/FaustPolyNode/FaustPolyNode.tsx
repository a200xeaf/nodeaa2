import React, {ChangeEvent, useCallback} from 'react';
import {Handle, Node, NodeProps, Position, useHandleConnections} from '@xyflow/react';
import {useEmitterSubscriptions} from "@/engine/utils/hooks/useEmitterSubscription.ts";
import {sendMidi} from "@/engine/audio.ts";
import {useNodeStore} from "@/engine/store.ts";
import {useShallow} from "zustand/react/shallow";
import NodeaaContainer from "@/ui/nodes-ui/NodeaaContainer.tsx";
import NodeaaHeader from "@/ui/nodes-ui/NodeaaHeader.tsx";
import NodeaaBody from "@/ui/nodes-ui/NodeaaBody.tsx";

type FaustPolyNodeData = {
    faustpoly_attack: number
    faustpoly_decay: number
    faustpoly_sustain: number
    faustpoly_release: number
    faustpoly_waveformsel: number
};

type FaustPolyNodeType = Node<FaustPolyNodeData, 'faustPolyNode'>;

const FaustPolyNode: React.FC<NodeProps<FaustPolyNodeType>> = ({id, data, selected}) => {
    const updateNode = useNodeStore(useShallow((state) => state.updateNode));
    const midiConnections = useHandleConnections({type: 'target', id: 'midi'})

    // Memoize handleMIDI to avoid re-creating on every render
    const handleMIDI = useCallback((e: Uint8Array) => {
        sendMidi(id, e);
    }, [id]);

    // Memoize setWaveform, only recreates when id or updateNode changes
    const setWaveform = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        updateNode(id, { faustpoly_waveformsel: +e.target.value });
    }, [id, updateNode]);

    // Memoize setADSR, same as setWaveform
    const setADSR = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        updateNode(id, { [`faustpoly_${e.target.id}`]: +e.target.value });
    }, [id, updateNode]);

    useEmitterSubscriptions({
        connections: midiConnections,
        callback: handleMIDI,
        data
    })

    return (
        <NodeaaContainer selected={selected} size={13}>
            <Handle type="target" position={Position.Top} id='midi' style={{backgroundColor: 'rgb(59, 130, 246)'}}/>
            <NodeaaHeader nodeName='Polyphonic Synth' headerColor='bg-amber-500' />
            <NodeaaBody size={11}>
                <div className="flex justify-between h-[8rem] px-4">
                    <label className="flex flex-col items-center w-6">
                        <span className="mb-8 text-sm">Attack</span>
                        <input
                            className="nodrag -rotate-90 w-[5rem]"
                            type="range"
                            min="0."
                            max="5"
                            step="0.01"
                            id="attack"
                            value={data.faustpoly_attack}
                            onChange={setADSR}
                        />
                    </label>
                    <label className="flex flex-col items-center w-6">
                        <span className="mb-8 text-sm">Decay</span>
                        <input
                            className="nodrag -rotate-90 w-[5rem]"
                            type="range"
                            min="0"
                            max="5"
                            step="0.01"
                            id="decay"
                            value={data.faustpoly_decay}
                            onChange={setADSR}
                        />
                    </label>
                    <label className="flex flex-col items-center w-6">
                        <span className="mb-8 text-sm">Sustain</span>
                        <input
                            className="nodrag -rotate-90 w-[5rem]"
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            id="sustain"
                            value={data.faustpoly_sustain}
                            onChange={setADSR}
                        />
                    </label>
                    <label className="flex flex-col items-center w-6">
                        <span className="mb-8 text-sm">Release</span>
                        <input
                            className="nodrag -rotate-90 w-[5rem]"
                            type="range"
                            min="0"
                            max="5"
                            step="0.01"
                            id="release"
                            value={data.faustpoly_release}
                            onChange={setADSR}
                        />
                    </label>
                </div>

                <hr className='my-2'/>

                <label className='flex flex-col'>
                    <span>Waveform:</span>
                    <select className="nodrag" value={data.faustpoly_waveformsel} onChange={setWaveform}>
                        <option value={0}>sine</option>
                        <option value={1}>square</option>
                        <option value={2}>sawtooth</option>
                        <option value={3}>triangle</option>
                        <option value={4}>noise</option>
                    </select>
                </label>
            </NodeaaBody>
            <Handle type="source" position={Position.Bottom} id='audio'/>
        </NodeaaContainer>
    );
};

export default React.memo(FaustPolyNode);
