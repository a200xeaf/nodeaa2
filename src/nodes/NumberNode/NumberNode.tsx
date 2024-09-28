import React, {ChangeEvent} from 'react'
import {useNodeStore} from "../../engine/store.ts";
import {useShallow} from "zustand/react/shallow";
import {Handle, Position, Node, NodeProps} from "@xyflow/react";
import {mainemitter} from "../../engine/eventbus.ts";

// Define the node data structure
type NumberNodeData = { number_number: number };

// Create a custom node type
type NumberNodeType = Node<NumberNodeData, 'numberNode'>;

const NumberNode: React.FC<NodeProps<NumberNodeType>> = ({id, data}) => {
    const updateNode = useNodeStore(useShallow((state) => state.updateNode));

    const handleNumber = (e: ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        // If the input is cleared, set the value to 0
        if (value === "") {
            updateNode(id, { number_number: 0 });
            mainemitter.emit(id + ":" + "number_number", 0);
            return;
        }

        value = value.replace(/^0+/, "") || "0"; // Fallback to "0" if all zeros are removed

        const finalNumber = Number(value)
        updateNode(id, { number_number: finalNumber });
        mainemitter.emit(id + ":" + "number_number", finalNumber);
    };

    return (
        <div className='w-60 h-[5rem] drop-shadow-lg'>
            <div className='flex items-center bg-gray-500 h-[2rem] px-1'>
                <p className='font-bold text-white'>Number</p>
            </div>
            <div className='flex flex-col justify-center nodrag cursor-default bg-white p-2 h-[3rem]'>
                <input type='number' min="0" max="1" step={0.01} value={data.number_number} onChange={handleNumber} className='bg-gray-200'/>
            </div>
            <Handle type="source" position={Position.Bottom} id='data-number_number' style={{ backgroundColor: 'grey' }} />
        </div>
    )
}
export default NumberNode
