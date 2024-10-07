import React, {useCallback} from 'react';
import {Handle, Node, NodeProps, Position, useHandleConnections} from '@xyflow/react';
import {useNodeStore} from '../../engine/store.ts';
import {useShallow} from "zustand/react/shallow";
import {useEmitterSubscriptions} from "../../hooks/useEmitterSubscription.ts";

type FaustGainNodeData = {
    faustgain_Gain: number
};

type FaustGainNodeType = Node<FaustGainNodeData, 'faustGainNode'>;

const FaustGainNode: React.FC<NodeProps<FaustGainNodeType>> = ({id, data}) => {
    const updateNode = useNodeStore(useShallow((state) => state.updateNode));
    const dataConnections = useHandleConnections({type: 'target', id: 'data'})

    const gainInDecibels = data.faustgain_Gain > 0
        ? (20 * Math.log10(data.faustgain_Gain))
        : -Infinity; // Handle zero gain case

    const setGain = useCallback(
        (e: React.ChangeEvent<HTMLInputElement> | number) => {
            // Check if the input is an event
            if (typeof e === 'number') {
                updateNode(id, { faustgain_Gain: e }); // Direct number case
            } else {
                updateNode(id, { faustgain_Gain: +e.target.value }); // ChangeEvent case
            }
        },
        [id, updateNode]
    );

    useEmitterSubscriptions({
        connections: dataConnections,
        callback: setGain,
        data
    })

    return (
        <div className='w-60 h-[7rem] drop-shadow-lg'>
            <div className="flex justify-evenly">
                <Handle type="target" position={Position.Top} id='audio' style={{ left: '30%' }}/>
                <Handle type="target" position={Position.Top} id='data' style={{ left: '70%', backgroundColor: 'grey' }}/>
            </div>
            <div className='flex items-center bg-purple-500 h-[2rem] px-1'>
                <p className='font-bold text-white'>Faust Gain</p>
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
                        value={data.faustgain_Gain}
                        onChange={setGain}
                    />
                </label>
                <span>{gainInDecibels === -Infinity ? `${gainInDecibels.toFixed(2)} ` : gainInDecibels.toFixed(2)}dB</span>
            </div>

            <Handle type="source" position={Position.Bottom} id='audio'/>
        </div>
    );
};

export default React.memo(FaustGainNode);
