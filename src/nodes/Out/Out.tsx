import React from 'react'
import {useNodeStore} from "../../engine/store.ts";
import {Handle, Position} from "@xyflow/react";

interface OutProps {
    id: string;
}

const Out: React.FC<OutProps> = ({ id }) => {
    const isRunning = useNodeStore((state) => state.isRunning);
    const toggleAudio = useNodeStore((state) => state.toggleAudio);

    return (
        <div className='w-28 h-[6rem] drop-shadow-lg'>
            <Handle type="target" position={Position.Top} />
            <div className='flex items-center bg-blue-500 h-[2rem] px-1'>
                <p className='font-bold text-white'>Audio Out</p>
            </div>
            <div className='flex flex-col nodrag cursor-default bg-white p-2 h-[4rem]'>
                <label>
                    <button onClick={toggleAudio}>
                        {isRunning ? (
                            <span>Running</span>
                        ) : (
                            <span>Not running</span>
                        )}
                    </button>
                </label>
            </div>
        </div>
    )
}
export default Out
