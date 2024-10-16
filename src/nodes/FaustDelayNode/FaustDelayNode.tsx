import {useCallback, FC, memo} from 'react';
import {Handle, Node, NodeProps, Position} from '@xyflow/react';
import {useNodeStore} from '@/engine/store.ts';
import {useShallow} from "zustand/react/shallow";
import Knob from "@/ui/inputs/Knob.tsx";
import {amountFormat, timeFormat} from "@/engine/utils/number-formats.ts";
import Numbox from "@/ui/inputs/Numbox.tsx";

type FaustDelayNodeData = {
    faustDelay_duration: number
    faustDelay_feedback: number
    faustDelay_wet: number
};

type FaustDelayNodeType = Node<FaustDelayNodeData, 'faustDelayNode'>;

const FaustDelayNode: FC<NodeProps<FaustDelayNodeType>> = ({id, data, selected}) => {
    const updateNode = useNodeStore(useShallow((state) => state.updateNode));

    const newSetParams = useCallback((name: string, value: number) => {
        updateNode(id, { [`faustDelay_${name}`]: value})
    }, [id, updateNode])

    return (
        <div className='w-60 h-[9rem] drop-shadow-lg'
             style={{
                 boxShadow: selected
                     ? '0 0 5px 2px rgba(59, 130, 246, 0.5)'  // Thicker shadow with lower opacity
                     : 'none',  // No shadow if not selected
             }}
        >
            <div className="flex justify-evenly">
                <Handle type="target" position={Position.Top} id='audio'/>
            </div>
            <div className='flex items-center bg-purple-500 h-[2rem] px-1'>
                <p className='font-bold text-white'>Delay</p>
            </div>
            <div className='flex justify-between nodrag cursor-default bg-white pb-2 pt-1 px-2 h-[7rem]'>
                <div className='flex flex-col items-center'>
                    <span>Duration</span>
                    <Knob value={data.faustDelay_duration} default_value={500} id='duration' max_value={2000}
                          min_value={1} callback={newSetParams}/>
                    <span>{timeFormat(data.faustDelay_duration)}</span>
                </div>
                <div className='flex flex-col items-center'>
                    <span>Feedback</span>
                    <Knob value={data.faustDelay_feedback} default_value={0.5} id='feedback' max_value={0.99}
                          min_value={0.0} callback={newSetParams}/>
                    <span>{amountFormat(data.faustDelay_feedback * 100)}</span>
                </div>
                <div className='flex flex-col items-center'>
                    <span>Dry/Wet</span>
                    <Numbox value={data.faustDelay_wet} default_value={0.5} id='wet' max_value={1}
                          min_value={0} callback={newSetParams} float={true}/>
                    <span>{amountFormat(data.faustDelay_wet * 100)}</span>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} id='audio'/>
        </div>
    );
};

export default memo(FaustDelayNode);
