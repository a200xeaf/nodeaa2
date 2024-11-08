import {useCallback, FC, memo} from 'react';
import {Handle, Node, NodeProps, Position} from '@xyflow/react';
import {useNodeStore} from '@/engine/store.ts';
import {useShallow} from "zustand/react/shallow";
import Knob from "@/ui/inputs/Knob.tsx";
import {amountFormat, timeFormat} from "@/engine/utils/number-formats.ts";
import NodeaaContainer from '@/ui/nodes-ui/NodeaaContainer';
import NodeaaHeader from "@/ui/nodes-ui/NodeaaHeader.tsx";

type FaustDelayNodeData = {
    faustDelay_duration: number
    faustDelay_feedback: number
    faustDelay_wet: number
};

type FaustDelayNodeType = Node<FaustDelayNodeData, 'faustDelayNode'>;

const FaustDelayNode: FC<NodeProps<FaustDelayNodeType>> = ({id, data, selected}) => {
    const updateNode = useNodeStore(useShallow((state) => state.updateNode));

    const setParams = useCallback((name: string, value: number) => {
        updateNode(id, { [`faustDelay_${name}`]: value})
    }, [id, updateNode])

    return (
        <NodeaaContainer selected={selected} width={15} height={9} infoID='faustDelayNode'>
            <Handle type="target" position={Position.Top} id='audio'/>
            <NodeaaHeader nodeName="Delay" headerColor='bg-purple-500' />
            <div className='flex justify-between nodrag cursor-default bg-white pb-2 pt-1 px-2 h-[7rem] rounded-b-xl'>
                <div className='flex flex-col items-center' data-info-panel-id="faustDelayNode-duration">
                    <span>Duration</span>
                    <Knob value={data.faustDelay_duration} default_value={500} id='duration' max_value={2000}
                          min_value={1} callback={setParams}/>
                    <span>{timeFormat(data.faustDelay_duration)}</span>
                </div>
                <div className='flex flex-col items-center' data-info-panel-id="faustDelayNode-feedback">
                    <span>Feedback</span>
                    <Knob value={data.faustDelay_feedback} default_value={0.5} id='feedback' max_value={0.99}
                          min_value={0.0} callback={setParams}/>
                    <span>{amountFormat(data.faustDelay_feedback * 100)}</span>
                </div>
                <div className='flex flex-col items-center' data-info-panel-id="faustDelayNode-wet">
                    <span>Dry/Wet</span>
                    <Knob value={data.faustDelay_wet} default_value={0.5} id='wet' max_value={1}
                          min_value={0} callback={setParams}/>
                    <span>{amountFormat(data.faustDelay_wet * 100)}</span>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} id='audio'/>
        </NodeaaContainer>
    );
};

export default memo(FaustDelayNode);
