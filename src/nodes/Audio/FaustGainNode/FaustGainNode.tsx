import {FC, memo, useCallback} from 'react';
import {Handle, Node, NodeProps, Position} from '@xyflow/react';
import {useNodeStore} from '@/engine/store.ts';
import {useShallow} from "zustand/react/shallow";
import NodeaaContainer from "@/ui/nodes-ui/NodeaaContainer.tsx";
import NodeaaHeader from "@/ui/nodes-ui/NodeaaHeader.tsx";
import Slider from "@/ui/inputs/Slider.tsx";
import {dbFormat} from "@/engine/utils/number-formats.ts";

type FaustGainNodeData = {
    faustgain_Gain: number
};

type FaustGainNodeType = Node<FaustGainNodeData, 'faustGainNode'>;

const FaustGainNode: FC<NodeProps<FaustGainNodeType>> = ({id, data, selected}) => {
    const updateNode = useNodeStore(useShallow((state) => state.updateNode));

    const setParams = useCallback((name: string, value: number) => {
        updateNode(id, { [`faustgain_${name}`]: value})
    }, [id, updateNode])

    return (
        <NodeaaContainer selected={selected} width={15} height={7} infoID='faustGainNode'>
            <Handle type="target" position={Position.Top} id='audio'/>
            <NodeaaHeader nodeName='Gain' headerColor='bg-purple-500' />
            <div className='flex flex-col justify-center items-start nodrag cursor-default bg-white p-2 h-[5rem] rounded-b-xl' data-info-panel-id="faustGainNode-gain">
                <span>Gain</span>
                <Slider id='Gain' callback={setParams} value={data.faustgain_Gain} min_value={0} max_value={1}
                        default_value={1} filled={true} orientation='horizontal' scale_exponent={1.4}/>
                <span>{dbFormat(20 * Math.log10(data.faustgain_Gain))}</span>
            </div>

            <Handle type="source" position={Position.Bottom} id='audio'/>
        </NodeaaContainer>
    );
};

export default memo(FaustGainNode);
