import { FC, memo } from "react"; // Removed useState
import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import NodeaaContainer from "@/ui/nodes-ui/NodeaaContainer.tsx"; // Adjust path if necessary
import NodeaaHeader from "@/ui/nodes-ui/NodeaaHeader.tsx"; // Adjust path if necessary
// Removed JSZip import
import EditorPreview from "@/components/editor/editorui/EditorPreview.tsx"; // Adjust path if necessary
import { FaustParameters } from "@/components/editor/EditorApp.tsx";
import { useNodeStore } from "@/engine/store.ts";
import { useShallow } from "zustand/react/shallow"; // Adjust path if necessary

// Type definitions remain the same
type FaustCustomNodeData = {
    customNodeMetadata: object;
};

type FaustCustomNodeType = Node<FaustCustomNodeData, "faustCustomNode">;

const FaustCustomNode: FC<NodeProps<FaustCustomNodeType>> = ({ selected, data, id }) => {
    const updateCustomNode = useNodeStore(useShallow((state) => state.updateCustomNode));

    const logParameters = (address: string, value: unknown) => {
        updateCustomNode(id, { [address]: value });
    };
    // Basic check to ensure customNodeMetadata exists and is an object
    const hasValidMetadata = data?.customNodeMetadata && typeof data.customNodeMetadata === "object";

    return (
        // Adjust height if needed now that file input is gone
        <NodeaaContainer selected={selected} width={34} height={18}>
            {/* Handles remain the same */}
            <Handle type="target" position={Position.Top} id="audio" style={{ backgroundColor: "limegreen" }} />

            {/* Header remains the same - Use name from metadata if available */}
            <NodeaaHeader
                nodeName={
                    (hasValidMetadata && (data.customNodeMetadata as unknown as FaustParameters)?.name) || "Custom Node"
                }
                headerColor="bg-purple-500"
            />

            {/* Main content area */}
            <div className="flex justify-center nodrag cursor-default bg-white pb-2 pt-1 px-2 h-[16rem] rounded-b-xl overflow-hidden">
                {" "}
                {/* Adjusted height */}
                <div className="flex flex-col items-center w-full">
                    {/* Removed file input element */}
                    {/* Removed file name display */}
                    {/* Removed error message display */}

                    {/* Editor Preview - ensure it handles potentially missing/invalid metadata */}
                    {hasValidMetadata ? (
                        <EditorPreview
                            // Cast the metadata to the expected FaustParameters type
                            // Add error handling or default values within EditorPreview if needed
                            parameters={data.customNodeMetadata as unknown as FaustParameters}
                            updateParameter={logParameters}
                        />
                    ) : (
                        <p className="text-xs text-red-500 p-4 text-center">
                            Invalid or missing metadata for this custom node.
                        </p>
                    )}
                </div>
            </div>

            {/* Handles remain the same */}
            <Handle type="source" position={Position.Bottom} id="audio" style={{ backgroundColor: "limegreen" }} />
        </NodeaaContainer>
    );
};

export default memo(FaustCustomNode);
