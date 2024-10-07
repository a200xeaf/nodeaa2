import {Node, NodeProps} from "@xyflow/react";
import React, {ChangeEvent, useState, useRef, useEffect, useCallback} from "react";
import {useNodeStore} from "@/engine/store.ts";
import {useShallow} from "zustand/react/shallow";

type CreatorNodeData = Record<string, never>;

type CreatorNodeType = Node<CreatorNodeData, 'creatorNode'>;

const CreatorNode: React.FC<NodeProps<CreatorNodeType>> = ({id}) => {
    const [search, setSearch] = useState("");
    const inputRef = useRef<HTMLInputElement>(null); // Ref for the input element
    const selfNodeDelete = useNodeStore(useShallow((state) => state.selfNodeDelete));

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length <= 40) {
            setSearch(e.target.value);
        }
    };

    // Ensure focus happens after the component and its parent have been rendered
    useEffect(() => {
        const focusInput = () => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        };
        // Use setTimeout to ensure focus after all rendering is complete
        const timer = setTimeout(focusInput, 50); // Short delay to ensure rendering completes

        return () => clearTimeout(timer);  // Clean up the timer on unmount
    }, []);

    // Handle the blur event (when input loses focus)
    const handleBlur = useCallback(() => {
        selfNodeDelete(id)
    }, [id, selfNodeDelete]);

    return (
        <div className='bg-white p-2 w-40 border-gray-200 border-2 rounded-lg'>
            <input
                type='text'
                value={search}
                onChange={handleSearch}
                onBlur={handleBlur}  // Add onBlur event to track when input loses focus
                ref={inputRef}  // Attach ref to the input
                maxLength={40}  // Set the max length of input text
                className='w-full focus:outline-none'  // Remove blue outline on focus
                placeholder="Start typing..."  // Optional placeholder text
                autoFocus
            />
        </div>
    );
};

export default React.memo(CreatorNode);