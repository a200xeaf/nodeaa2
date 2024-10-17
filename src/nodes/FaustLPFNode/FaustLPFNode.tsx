import React, {ChangeEvent, useCallback} from 'react';
import {Handle, Node, NodeProps, Position} from '@xyflow/react';
import {useNodeStore} from '../../engine/store.ts';
import {useShallow} from "zustand/react/shallow";
import NodeaaContainer from "@/ui/nodes-ui/NodeaaContainer.tsx";
import NodeaaHeader from "@/ui/nodes-ui/NodeaaHeader.tsx";

type FaustLPFNodeData = {
    faustLPF_frequency: number
    faustLPF_frequencyVisible_data: number
    faustLPF_quality: number
};

type FaustLPFNodeType = Node<FaustLPFNodeData, 'faustLPFNode'>;

const FaustLPFNode: React.FC<NodeProps<FaustLPFNodeType>> = ({id, data, selected}) => {
    const updateNode = useNodeStore(useShallow((state) => state.updateNode));

    const setParams = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.id === 'frequency') {
            const normalizedValue = +e.target.value
            const logFrequency = normalizedToLogFrequency(normalizedValue)
            updateNode(id, { [`faustLPF_${e.target.id}`]: logFrequency });
            updateNode(id, { [`faustLPF_${e.target.id}Visible_data`]: normalizedValue });
        } else {
            updateNode(id, { [`faustLPF_${e.target.id}`]: +e.target.value })
        }
    }, [id, updateNode]);

    // Function to map normalized value (0.0 - 1.0) to logarithmic frequency
    const normalizedToLogFrequency = useCallback((normalizedValue: number) => {
        const minLog = Math.log10(20);
        const maxLog = Math.log10(20000);
        const adjustedScale = Math.pow(normalizedValue, 0.5);

        return Math.pow(10, minLog + adjustedScale * (maxLog - minLog));
    }, []);

    return (
        <NodeaaContainer selected={selected} width={15} height={13}>
            <div className="flex justify-evenly">
                <Handle type="target" position={Position.Top} id='audio' style={{ left: '30%' }}/>
                <Handle type="target" position={Position.Top} id='data' style={{ left: '70%', backgroundColor: 'grey' }}/>
            </div>
            <NodeaaHeader nodeName='Lowpass Filter' headerColor='bg-purple-500' />
            <div className='flex flex-col justify-center nodrag cursor-default bg-white p-2 h-[11rem] rounded-b-xl'>
                <label>
                    <span>Frequency:</span>
                    <input
                        id='frequency'
                        className="nodrag"
                        type="range"
                        min="0"
                        max="1.0"
                        step="0.001"
                        value={data.faustLPF_frequencyVisible_data}
                        onChange={setParams}
                    />
                </label>
                <span>{data.faustLPF_frequency.toFixed(2)}</span>
                <label>
                    <span>Quality:</span>
                    <input
                        id="quality"
                        className="nodrag"
                        type="range"
                        min="0.1"
                        max="6"
                        step="0.01"
                        value={data.faustLPF_quality}
                        onChange={setParams}
                    />
                </label>
                <span>{data.faustLPF_quality}</span>
            </div>

            <Handle type="source" position={Position.Bottom} id='audio'/>
        </NodeaaContainer>
    );
};

export default React.memo(FaustLPFNode);
