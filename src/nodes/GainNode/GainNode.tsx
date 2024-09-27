// ./src/nodes/Osc.tsx
import React, {useCallback, useEffect} from 'react';
import {Handle, Node, NodeProps, Position, useHandleConnections} from '@xyflow/react';
import {useNodeStore} from '../../engine/store.ts';
import {useShallow} from "zustand/react/shallow";

type GainNodeData = {
    gain_gain: number
};

type GainNodeType = Node<GainNodeData, 'gainNode'>;

const GainNode: React.FC<NodeProps<GainNodeType>> = ({id, data}) => {
    const updateNode = useNodeStore(useShallow((state) => state.updateNode));
    const connections = useHandleConnections({type: 'target', id: 'data'})

    // Update connected node IDs whenever connections change
    useEffect(() => {
        const nodeIds = connections.map((connection) => connection.source);
        console.log(nodeIds)
    }, [connections]);

    const gainInDecibels = data.gain_gain > 0
        ? (20 * Math.log10(data.gain_gain))
        : -Infinity; // Handle zero gain case

    const setGain = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            updateNode(id, {gain_gain: +e.target.value});
        },
        [id, updateNode]
    );

    return (
        <div className='w-60 h-[7rem] drop-shadow-lg'>
            <div className="flex justify-evenly">
                <Handle type="target" position={Position.Top} id='audio' style={{ left: '30%' }}/>
                <Handle type="target" position={Position.Top} id='data' style={{ left: '70%', backgroundColor: 'grey' }}/>
            </div>
            <div className='flex items-center bg-green-500 h-[2rem] px-1'>
                <p className='font-bold text-white'>Gain</p>
            </div>
            <div className='flex flex-col justify-center nodrag cursor-default bg-white p-2 h-[5rem]'>
                <label>
                    <span>Gain:</span>
                    <input
                        className="nodrag"
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={data.gain_gain}
                        onChange={setGain}
                    />
                </label>
                <span>{gainInDecibels === -Infinity ? `${gainInDecibels.toFixed(2)} ` : gainInDecibels.toFixed(2)}dB</span>
            </div>

            <Handle type="source" position={Position.Bottom} id='audio'/>
        </div>
    );
};

export default GainNode;
