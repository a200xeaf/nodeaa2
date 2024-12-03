import {useCallback, FC, memo} from 'react';
import {Handle, Node, NodeProps, Position} from '@xyflow/react';
import {useNodeStore} from '@/engine/store.ts';
import {useShallow} from "zustand/react/shallow";
import Knob from "@/ui/inputs/Knob.tsx";
import {amountFormat, dbFormat} from "@/engine/utils/number-formats.ts";
import NodeaaContainer from '@/ui/nodes-ui/NodeaaContainer.tsx';
import NodeaaHeader from "@/ui/nodes-ui/NodeaaHeader.tsx";

type FaustAmpNodeData = {
    faustAmp_gain: number
    faustAmp_wet: number
};

type FaustAmpNodeType = Node<FaustAmpNodeData, 'faustDelayNode'>;

const FaustAmpNode: FC<NodeProps<FaustAmpNodeType>> = ({id, data, selected}) => {
    const updateNode = useNodeStore(useShallow((state) => state.updateNode));

    const setParams = useCallback((name: string, value: number) => {
        updateNode(id, { [`faustAmp_${name}`]: value})
    }, [id, updateNode])

    return (
        <NodeaaContainer selected={selected} width={9} height={9} infoID='faustAmpNode'>
            <Handle type="target" position={Position.Top} id='audio'/>
            <NodeaaHeader nodeName="Amp" headerColor='bg-purple-500' />
            <div className='flex justify-between nodrag cursor-default bg-white pb-2 pt-1 px-2 h-[7rem] rounded-b-xl'>
                <div className='flex flex-col items-center' data-info-panel-id="faustAmpNode-duration">
                    <span>Gain</span>
                    <Knob value={data.faustAmp_gain} default_value={1} id='gain' max_value={60}
                          min_value={1} callback={setParams}/>
                    <span>{dbFormat(data.faustAmp_gain)}</span>
                </div>
                <div className='flex flex-col items-center' data-info-panel-id="faustAmpNode-wet">
                    <span>Dry/Wet</span>
                    <Knob value={data.faustAmp_wet} default_value={0.5} id='wet' max_value={1}
                          min_value={0} callback={setParams}/>
                    <span>{amountFormat(data.faustAmp_wet * 100)}</span>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} id='audio'/>
        </NodeaaContainer>
    );
};

export default memo(FaustAmpNode);
