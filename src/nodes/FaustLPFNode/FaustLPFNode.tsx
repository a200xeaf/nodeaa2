import React, {useCallback} from 'react';
import {Handle, Node, NodeProps, Position} from '@xyflow/react';
import {useNodeStore} from '../../engine/store.ts';
import {useShallow} from "zustand/react/shallow";
import NodeaaContainer from "@/ui/nodes-ui/NodeaaContainer.tsx";
import NodeaaHeader from "@/ui/nodes-ui/NodeaaHeader.tsx";
import Knob from "@/ui/inputs/Knob.tsx";
import {fixedMax, frequencyFormat} from "@/engine/utils/number-formats.ts";

type FaustLPFNodeData = {
    faustLPF_frequency: number
    faustLPF_quality: number
};

type FaustLPFNodeType = Node<FaustLPFNodeData, 'faustLPFNode'>;

const FaustLPFNode: React.FC<NodeProps<FaustLPFNodeType>> = ({id, data, selected}) => {
    const updateNode = useNodeStore(useShallow((state) => state.updateNode));

    const setParams = useCallback((name: string, value: number) => {
        updateNode(id, { [`faustLPF_${name}`]: value})
    }, [id, updateNode])

    return (
        <NodeaaContainer selected={selected} width={11} height={9} infoID='faustLPFNode'>
            <Handle type="target" position={Position.Top} id='audio'/>
            <NodeaaHeader nodeName='Lowpass Filter' headerColor='bg-purple-500' />
            <div className='flex flex-row justify-between nodrag cursor-default bg-white p-2 h-[7rem] rounded-b-xl'>
                <div className='flex flex-col items-center' data-info-panel-id="faustLPFNode-frequency">
                    <span className='w-20 text-center'>Frequency</span>
                    <Knob value={data.faustLPF_frequency} default_value={2000} id='frequency' max_value={20000}
                          min_value={20} scale_exponent={0.33} callback={setParams}/>
                    <span>{frequencyFormat(data.faustLPF_frequency)}</span>
                </div>
                <div className='flex flex-col items-center' data-info-panel-id="faustLPFNode-quality">
                    <span className='w-20 text-center'>Quality</span>
                    <Knob value={data.faustLPF_quality} default_value={0.1} id='quality' max_value={6.0}
                          min_value={0.1} callback={setParams}/>
                    <span>{fixedMax(data.faustLPF_quality, 2)}</span>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} id='audio'/>
        </NodeaaContainer>
    );
};

export default React.memo(FaustLPFNode);
