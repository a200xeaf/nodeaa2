import React, {ChangeEvent, useCallback} from 'react';
import {Handle, Node, NodeProps, Position} from '@xyflow/react';
import {useNodeStore} from '../../engine/store.ts';
import {useShallow} from "zustand/react/shallow";

type FaustDelayNodeData = {
    faustDelay_duration: number
    faustDelay_feedback: number
    faustDelay_wet: number
};

type FaustDelayNodeType = Node<FaustDelayNodeData, 'faustDelayNode'>;

const FaustDelayNode: React.FC<NodeProps<FaustDelayNodeType>> = ({id, data, selected}) => {
    const updateNode = useNodeStore(useShallow((state) => state.updateNode));

    const setParams = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        updateNode(id, { [`faustDelay_${e.target.id}`]: +e.target.value })
    }, [id, updateNode]);

    return (
        <div className='w-60 h-[18rem] drop-shadow-lg'
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
            <div className='flex flex-col justify-center nodrag cursor-default bg-white p-2 h-[16rem]'>
                <label>
                    <span>Delay:</span>
                    <input
                        id='duration'
                        className="nodrag"
                        type="range"
                        min="1"
                        max="2000.0"
                        step="0.1"
                        value={data.faustDelay_duration}
                        onChange={setParams}
                    />
                </label>
                <span>{data.faustDelay_duration}ms</span>
                <label>
                    <span>Feedback:</span>
                    <input
                        id="feedback"
                        className="nodrag"
                        type="range"
                        min="0.0"
                        max="0.99"
                        step="0.001"
                        value={data.faustDelay_feedback}
                        onChange={setParams}
                    />
                </label>
                <span>{(data.faustDelay_feedback * 100).toFixed(1)}%</span>
                <label>
                    <span>Dry/Wet:</span>
                    <input
                        id="wet"
                        className="nodrag"
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.001"
                        value={data.faustDelay_wet}
                        onChange={setParams}
                    />
                </label>
                <span>{(data.faustDelay_wet * 100).toFixed(1)}%</span>
            </div>

            <Handle type="source" position={Position.Bottom} id='audio'/>
        </div>
    );
};

export default React.memo(FaustDelayNode);
