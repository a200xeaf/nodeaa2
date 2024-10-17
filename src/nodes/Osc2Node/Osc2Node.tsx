import React, {useCallback} from 'react';
import {Handle, Node, NodeProps, Position} from '@xyflow/react';
import { useNodeStore } from '../../engine/store.ts';
import {useShallow} from "zustand/react/shallow";
import NodeaaContainer from "@/ui/nodes-ui/NodeaaContainer.tsx";
import NodeaaHeader from "@/ui/nodes-ui/NodeaaHeader.tsx";

type Osc2NodeData = {
    osc_frequency: number,
    osc_type: number
};

type Osc2NodeType = Node<Osc2NodeData, 'osc2Node'>;

const Osc2Node: React.FC<NodeProps<Osc2NodeType>> = ({ id, data, selected }) => {
    const updateNode = useNodeStore(useShallow((state) => state.updateNode));

    const setFrequency = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            updateNode(id, { osc_frequency: +e.target.value });
        },
        [id, updateNode]
    );

    const setType = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            updateNode(id, { osc_type: +e.target.value });
        },
        [id, updateNode]
    );

    return (
        <NodeaaContainer selected={selected} width={15} height={13}>
            <NodeaaHeader nodeName='Oscillator Node' headerColor='bg-pink-500' />
            <div className='flex flex-col nodrag cursor-default bg-white p-2 h-[11rem] rounded-b-xl'>
                <label>
                    <span>Frequency:</span>
                    <input
                        className="nodrag"
                        type="range"
                        min="10"
                        max="1000"
                        value={data.osc_frequency}
                        onChange={setFrequency}
                    />
                    <span>{data.osc_frequency}Hz</span>
                </label>

                <hr className='my-2'/>

                <label className='flex flex-col'>
                    <span>Waveform:</span>
                    <select className="nodrag" value={data.osc_type} onChange={setType}>
                        <option value={0}>sine</option>
                        <option value={1}>square</option>
                        <option value={2}>triangle</option>
                        <option value={3}>sawtooth</option>
                        <option value={4}>noise</option>
                    </select>
                </label>
            </div>

            <Handle type="source" position={Position.Bottom} id='audio'/>
        </NodeaaContainer>
    );
};

export default Osc2Node;
