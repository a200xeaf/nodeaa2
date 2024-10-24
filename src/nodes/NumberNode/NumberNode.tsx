import React, { ChangeEvent, useState, useEffect } from 'react';
import { useNodeStore } from "../../engine/store.ts";
import { useShallow } from "zustand/react/shallow";
import { Handle, Position, Node, NodeProps } from "@xyflow/react";
import { mainemitter } from "../../engine/utils/eventbus.ts";
import NodeaaContainer from "@/ui/nodes-ui/NodeaaContainer.tsx";
import NodeaaHeader from "@/ui/nodes-ui/NodeaaHeader.tsx";

// Define the node data structure
type NumberNodeData = { number_number: number };

// Create a custom node type
type NumberNodeType = Node<NumberNodeData, 'numberNode'>;

const NumberNode: React.FC<NodeProps<NumberNodeType>> = ({ id, data, selected }) => {
    const updateNode = useNodeStore(useShallow((state) => state.updateNode));

    // Local state to manage input value
    const [inputValue, setInputValue] = useState<string>(String(data.number_number));

    // Sync local state with data.number_number
    useEffect(() => {
        setInputValue(String(data.number_number));
    }, [data.number_number]);

    const handleNumber = (e: ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        // If the input is cleared, set the value to "0"
        if (value === "") {
            value = "0";
        }

        // Remove leading zeros only if they are followed by a digit
        value = value.replace(/^0+(?=\d)/, "");

        const finalNumber = Number(value);
        setInputValue(value);
        updateNode(id, { number_number: finalNumber });
        mainemitter.emit(`${id}:number_number`, finalNumber);
    };

    return (
        <NodeaaContainer selected={selected} width={15} height={5}>
            <NodeaaHeader nodeName='Number' headerColor='bg-gray-500' />
            <div className='flex flex-col justify-center nodrag cursor-default bg-white p-2 h-[3rem] rounded-b-xl'>
                <input
                    type='number'
                    min="0"
                    max="1"
                    step={0.01}
                    value={inputValue}
                    onChange={handleNumber}
                    className='bg-gray-200'
                />
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                id='data-number_number'
                style={{ backgroundColor: 'grey' }}
            />
        </NodeaaContainer>
    );
};

export default NumberNode;