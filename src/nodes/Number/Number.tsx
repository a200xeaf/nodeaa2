import React, {ChangeEvent} from 'react'
import {useNodeStore} from "../../engine/store.ts";
import {useShallow} from "zustand/react/shallow";
import {Handle, Position} from "@xyflow/react";

interface NumberProps {
    id: string,
    data: {
        number_number: number,
    }
}

const Number: React.FC<NumberProps> = ({id, data}) => {
    const updateNode = useNodeStore(useShallow((state) => state.updateNode));

    const handleNumber = (e: ChangeEvent<HTMLInputElement>) => {
        updateNode(id, { number_number: +e.target.value });
    }

    return (
        <div className='w-60 h-[5rem] drop-shadow-lg'>
            <div className='flex items-center bg-red-300 h-[2rem] px-1'>
                <p className='font-bold text-white'>Number</p>
            </div>
            <div className='flex flex-col justify-center nodrag cursor-default bg-white p-2 h-[3rem]'>
                <input type='number' min="0" max="1" step={0.1} value={data.number_number} onChange={handleNumber} className='bg-gray-200'/>
            </div>
            <Handle type="source" position={Position.Bottom} id='data' style={{ backgroundColor: 'grey' }} />
        </div>
    )
}
export default Number
