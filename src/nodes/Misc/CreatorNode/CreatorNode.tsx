import React, { ChangeEvent, useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import { Node, NodeProps } from "@xyflow/react";
import { useNodeStore } from "@/engine/store"; // Adjust path
import { useShallow } from "zustand/react/shallow";
import {
    NodesConfig,
    NodeConfig,
    FaustCustomNodeConfig,
    FaustCustomNodesConfig, // Assuming this type exists in store types
} from "@/engine/types/node-types"; // Adjust path
import rawNodesConfig from "@/engine/data/nodes.json"; // Static nodes
import NodeBadge from "@/ui/nodes-ui/NodeBadge"; // Adjust path

// Type definitions (assuming they are imported or defined above)

// Combined type for search results
type BadgeType = "midi" | "data" | "instrument" | "effect" | "unknown";
interface SearchResult {
    id: string; // Unique key for list item (nodeName or custom node key)
    displayName: string; // Name shown in UI (realName or custom name)
    nodeType: "standard" | "custom"; // Origin type
    nodeKey: string; // Key used for creation (nodeName or custom key)
    badgeType: BadgeType; // Badge type
}

type CreatorNodeData = Record<string, never>;
type CreatorNodeType = Node<CreatorNodeData, "creatorNode">;

// Load static config
const staticNodesConfig: NodesConfig = rawNodesConfig as NodesConfig;

const CreatorNode: React.FC<NodeProps<CreatorNodeType>> = ({ id, positionAbsoluteX, positionAbsoluteY }) => {
    const [search, setSearch] = useState("");
    const [selectedIndex, setSelectedIndex] = useState<number>(0); // Default to first item
    const inputRef = useRef<HTMLInputElement>(null);
    const nodeRef = useRef<HTMLDivElement>(null);

    // --- Get state and actions from Zustand Store ---
    const { selfNodeDelete, createNode, createCustomNode, externalNodes } = useNodeStore(
        useShallow((state) => ({
            selfNodeDelete: state.selfNodeDelete,
            createNode: state.createNode,
            createCustomNode: state.createCustomNode,
            // Get the custom nodes from the store state
            externalNodes: state.externalNodes as FaustCustomNodesConfig, // Cast if needed
        })),
    );

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        // Limit input length for performance/display reasons if desired
        if (e.target.value.length <= 40) {
            setSearch(e.target.value);
            setSelectedIndex(0); // Reset index on new search
        }
    };

    // --- Combine and Filter Results ---
    const filteredResults = useMemo<SearchResult[]>(() => {
        const searchTerm = search.toLowerCase().trim();
        if (searchTerm === "") {
            return []; // No search term, no results
        }

        // Map static nodes
        const standardResults: SearchResult[] = Object.values(staticNodesConfig)
            .map((node: NodeConfig): SearchResult => {
                let badgeType: BadgeType = "unknown";
                if (node.idPrefix === "") {
                    if (node.hasAudio && node.audioType) {
                        badgeType = node.audioType === "instrument" ? "instrument" : "effect";
                    }
                } else {
                    switch (node.idPrefix) {
                        case "midi":
                            badgeType = "midi";
                            break;
                        case "data":
                            badgeType = "data";
                            break;
                        default:
                            badgeType = "unknown";
                            break;
                    }
                }
                return {
                    id: node.nodeName, // Use nodeName as unique id
                    displayName: node.realName,
                    nodeType: "standard",
                    nodeKey: node.nodeName, // Key for createNode
                    badgeType: badgeType,
                };
            })
            .filter((node) => node.displayName.toLowerCase().includes(searchTerm));

        // Map custom nodes from Zustand state
        const customResults: SearchResult[] = Object.entries(externalNodes)
            .map(
                ([key, node]: [string, FaustCustomNodeConfig]): SearchResult => ({
                    id: key, // Use the key from externalNodes as unique id
                    displayName: node.name, // Use the name field from custom config
                    nodeType: "custom",
                    nodeKey: key, // Key for the custom creation logic
                    badgeType: "effect", // All custom nodes are effects
                }),
            )
            .filter((node) => node.displayName.toLowerCase().includes(searchTerm));

        // Combine and return (potentially sort)
        return [...standardResults, ...customResults].sort(
            (a, b) => a.displayName.localeCompare(b.displayName), // Optional: sort alphabetically
        );
    }, [search, externalNodes]); // Re-run when search or externalNodes change

    // --- Creation Handlers ---
    const handleCreateStandard = useCallback(
        (nodeKey: string) => {
            createNode(nodeKey, { x: positionAbsoluteX, y: positionAbsoluteY });
            selfNodeDelete(id);
        },
        [createNode, selfNodeDelete, id, positionAbsoluteX, positionAbsoluteY],
    );

    const handleCreateCustom = useCallback(
        (nodeKey: string) => {
            createCustomNode(nodeKey, { x: positionAbsoluteX, y: positionAbsoluteY });
            selfNodeDelete(id);
        },
        [createCustomNode, positionAbsoluteX, positionAbsoluteY, selfNodeDelete, id],
    );

    // General handler called by UI events
    const handleCreate = useCallback(
        (result: SearchResult | undefined) => {
            if (!result) return;

            if (result.nodeType === "standard") {
                handleCreateStandard(result.nodeKey);
            } else if (result.nodeType === "custom") {
                handleCreateCustom(result.nodeKey);
            }
        },
        [handleCreateStandard, handleCreateCustom],
    );

    // --- Effects for Focus and Keyboard Navigation ---
    useEffect(() => {
        const timer = setTimeout(() => inputRef.current?.focus(), 50);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                selfNodeDelete(id);
                return;
            }

            if (filteredResults.length === 0) return; // No results to navigate

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : prev));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0)); // Stay at 0 if at top
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < filteredResults.length) {
                    // Call the general create handler with the selected result
                    handleCreate(filteredResults[selectedIndex]);
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
        // Dependencies include handleCreate now
    }, [filteredResults, selectedIndex, handleCreate, selfNodeDelete, id]);

    // Handle the blur event (when input or node loses focus)
    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLDivElement>) => {
            // Check if the new focused element is outside the node's main div
            if (nodeRef.current && !nodeRef.current.contains(e.relatedTarget as Element | null)) {
                selfNodeDelete(id);
            }
        },
        [id, selfNodeDelete],
    );

    return (
        <div
            className="bg-white p-2 w-64 border-gray-200 border-2 rounded-lg nodrag z-[9999]" // Ensure high z-index
            ref={nodeRef}
            onBlur={handleBlur} // Add blur handler to the container
            tabIndex={-1} // Make div focusable for reliable blur detection
        >
            <input
                type="text"
                value={search}
                onChange={handleSearch}
                // No direct onBlur needed on input if parent handles it
                ref={inputRef}
                maxLength={40}
                className="w-full focus:outline-none mb-1" // Removed specific blue outline removal, added margin
                placeholder="Search nodes..."
                aria-autocomplete="list"
                aria-controls="search-results-list"
            />
            {filteredResults.length > 0 && (
                <>
                    <hr className="border-gray-200 border-[1px] rounded-lg" />
                    <ul id="search-results-list" className="mt-2 max-h-60 overflow-y-auto">
                        {" "}
                        {/* Added max-height and scroll */}
                        {filteredResults.map((result, index) => (
                            <li
                                key={result.id} // Use the unique id from SearchResult
                                id={`search-result-${result.id}`}
                                role="option"
                                aria-selected={selectedIndex === index}
                                className={`flex items-center text-sm text-gray-700 p-1 rounded-lg cursor-pointer ${
                                    selectedIndex === index ? "bg-blue-100" : "hover:bg-gray-100" // Subtle hover
                                }`}
                                // Use onMouseDown to trigger create before blur potentially fires
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleCreate(result);
                                }}
                            >
                                <NodeBadge type={result.badgeType} /> {/* Use pre-calculated badge type */}
                                {/* Use a div or span instead of button if whole li is clickable */}
                                <span className="ml-2 w-full text-left focus:outline-none">
                                    {result.displayName} {/* Display name */}
                                </span>
                            </li>
                        ))}
                    </ul>
                </>
            )}
            {search !== "" && filteredResults.length === 0 && (
                <p className="text-xs text-gray-500 mt-2">No matching nodes found.</p>
            )}
        </div>
    );
};

export default memo(CreatorNode);
