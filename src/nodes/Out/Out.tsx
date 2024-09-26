import React from 'react'
import {useNodeStore} from "../../engine/store.ts";
import {Handle, Position} from "@xyflow/react";
import {useShallow} from "zustand/react/shallow";

interface OutProps {
    id: string;
}

const Out: React.FC<OutProps> = ({ id }) => {
    const isRunning = useNodeStore(useShallow((state) => state.isRunning));
    const toggleAudio = useNodeStore(useShallow((state) => state.toggleAudio));

    return (
        <div className='w-28 h-[6rem] drop-shadow-lg'>
            <Handle type="target" position={Position.Top} id="audio"/>
            <div className='flex items-center bg-blue-500 h-[2rem] px-1'>
                <p className='font-bold text-white'>Audio Out</p>
            </div>
            <div className='flex flex-col nodrag cursor-default bg-white p-2 h-[4rem] justify-center items-center'>
                <label>
                    <button
                        onClick={toggleAudio}
                        className={`font-bold text-center p-1 text-sm ${isRunning ? 'bg-green-500' : 'bg-red-500'}`}>
                        {isRunning ? (
                            <span className='text-white'>Running</span>
                        ) : (
                            <span className='text-black'>Not running</span>
                        )}
                    </button>
                </label>
            </div>
        </div>
    )
}
export default Out
