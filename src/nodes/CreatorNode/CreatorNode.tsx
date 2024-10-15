import {Node, NodeProps} from "@xyflow/react";
import React, {ChangeEvent, useState, useRef, useEffect, useCallback, useMemo} from "react";
import {useNodeStore} from "@/engine/store.ts";
import {useShallow} from "zustand/react/shallow";
import {NodesConfig} from "@/engine/types/nodetypes.ts";
import rawNodesConfig from "@/engine/nodes.json";

type CreatorNodeData = Record<string, never>;

type CreatorNodeType = Node<CreatorNodeData, 'creatorNode'>;

const nodesConfig: NodesConfig = rawNodesConfig as NodesConfig;

const CreatorNode: React.FC<NodeProps<CreatorNodeType>> = ({id, positionAbsoluteX, positionAbsoluteY}) => {
    const [search, setSearch] = useState("");
    const [selectedIndex, setSelectedIndex] = useState<number>(-1); // Track the selected result index
    const inputRef = useRef<HTMLInputElement>(null); // Ref for the input element
    const nodeRef = useRef<HTMLDivElement>(null);
    const selfNodeDelete = useNodeStore(useShallow((state) => state.selfNodeDelete));
    const createNode = useNodeStore(useShallow((state) => state.createNode));

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length <= 40) {
            setSearch(e.target.value);
            setSelectedIndex(0);
        }
    };

    // Filter the nodes based on the `search` input, matching `realName`
    const filteredResults = useMemo(() => {
        if (search === "") {
            return []
        }
        return Object.values(nodesConfig)
            .filter(node => node.realName.toLowerCase().includes(search.toLowerCase()))
            .map(node => node); // Return only the realName field
    }, [search]); // Recalculate only when search changes

    const handleCreate = useCallback((name: string) => {
        createNode(name, {x: positionAbsoluteX, y: positionAbsoluteY})
        selfNodeDelete(id)
    }, [positionAbsoluteX, positionAbsoluteY])

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

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                selfNodeDelete(id)
            }

            if (filteredResults.length === 0) return;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prevIndex) =>
                    prevIndex < filteredResults.length - 1 ? prevIndex + 1 : prevIndex
                );
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : -1));
            } else if (e.key === "Enter" && selectedIndex >= 0) {
                e.preventDefault();
                handleCreate(filteredResults[selectedIndex].nodeName)
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [filteredResults, selectedIndex, handleCreate]);

    // Handle the blur event (when input loses focus)
    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        const targetElement = e.relatedTarget as Element | null;

        if (nodeRef.current && (!targetElement || !nodeRef.current.contains(targetElement))) {
            selfNodeDelete(id);
        }
    }, [id, selfNodeDelete]);

    return (
        <div className='bg-white p-2 w-64 border-gray-200 border-2 rounded-lg nodrag' ref={nodeRef}>
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
            {filteredResults.length > 0 && (
                <>
                    <hr className='border-gray-200 mt-2 border-[1px] rounded-lg' />
                    <ul className="mt-2">
                        {filteredResults.map((result, index) => (
                            <li
                                key={index}
                                className={`text-sm text-gray-700 p-1 rounded-lg ${
                                    selectedIndex === index ? "bg-blue-100" : "hover:bg-blue-100"
                                }`}
                            >
                                <button
                                    onClick={() => handleCreate(result.nodeName)}  // Log the clicked result
                                    className="w-full text-left focus:outline-none"  // Make the button take full width and remove focus outline
                                >
                                    {result.realName}
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default React.memo(CreatorNode);