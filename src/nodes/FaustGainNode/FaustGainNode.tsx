import React, {useCallback} from 'react';
import {Handle, Node, NodeProps, Position, useHandleConnections} from '@xyflow/react';
import {useNodeStore} from '../../engine/store.ts';
import {useShallow} from "zustand/react/shallow";
import {useEmitterSubscriptions} from "@/engine/utils/hooks/useEmitterSubscription.ts";
import NodeaaContainer from "@/ui/nodes-ui/NodeaaContainer.tsx";
import NodeaaHeader from "@/ui/nodes-ui/NodeaaHeader.tsx";
import {clamp} from "@/engine/utils/number-operations.ts";

type FaustGainNodeData = {
    faustgain_Gain: number
};

type FaustGainNodeType = Node<FaustGainNodeData, 'faustGainNode'>;

const FaustGainNode: React.FC<NodeProps<FaustGainNodeType>> = ({id, data, selected}) => {
    const updateNode = useNodeStore(useShallow((state) => state.updateNode));
    const dataConnections = useHandleConnections({type: 'target', id: 'data'})

    const gainInDecibels = data.faustgain_Gain > 0
        ? (20 * Math.log10(data.faustgain_Gain))
        : -Infinity; // Handle zero gain case

    const setGain = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            // Check if the input is an event
            const final: number = clamp(e.target.valueAsNumber, 0, 1)
            updateNode(id, { faustgain_Gain: final }); // Direct number case
        },
        [id, updateNode]
    );

    useEmitterSubscriptions({
        connections: dataConnections,
        callback: setGain,
        data
    })

    return (
        <NodeaaContainer selected={selected} width={15} height={7}>
            <div className="flex justify-evenly">
                <Handle type="target" position={Position.Top} id='audio' style={{ left: '30%' }}/>
                <Handle type="target" position={Position.Top} id='data' style={{ left: '70%', backgroundColor: 'grey' }}/>
            </div>
            <NodeaaHeader nodeName='Gain' headerColor='bg-purple-500' />
            <div className='flex flex-col justify-center nodrag cursor-default bg-white p-2 h-[5rem] rounded-b-xl'>
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
        </NodeaaContainer>
    );
};

export default React.memo(FaustGainNode);
