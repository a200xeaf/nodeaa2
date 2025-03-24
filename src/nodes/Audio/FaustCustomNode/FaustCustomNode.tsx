import { FC, memo, useState } from "react";
import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import NodeaaContainer from "@/ui/nodes-ui/NodeaaContainer.tsx";
import NodeaaHeader from "@/ui/nodes-ui/NodeaaHeader.tsx";
import JSZip from "jszip";

type FaustCustomNodeData = {
    faustAmp_gain: number;
    faustAmp_wet: number;
};

type FaustCustomNodeType = Node<FaustCustomNodeData, "faustCustomNode">;

const FaustCustomNode: FC<NodeProps<FaustCustomNodeType>> = ({ selected }) => {
    const [zipFile, setZipFile] = useState<File | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setErrorMessage(null); // clear any previous errors
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setZipFile(file);
            console.log("Selected file:", file);

            // Use JSZip to load the zip file
            JSZip.loadAsync(file)
                .then((zip) => {
                    const allowedFiles = ["dsp-meta.json", "dsp-module.wasm"];
                    const zipFiles = Object.keys(zip.files);

                    // Validate that the zip contains only the allowed files
                    if (
                        zipFiles.length !== allowedFiles.length ||
                        !allowedFiles.every((name) => zipFiles.includes(name))
                    ) {
                        setZipFile(null);
                        setErrorMessage("Invalid zip");
                        console.error("Zip validation failed. Found files:", zipFiles);
                        return;
                    }

                    // Valid zip: log the zip content and file contents
                    console.log("Valid zip file:", zip);
                    allowedFiles.forEach((fileName) => {
                        zip.files[fileName]
                            .async("string")
                            .then((content) => {
                                console.log(`${fileName} content:`, content);
                            })
                            .catch((err) => {
                                console.error(`Failed to read ${fileName}:`, err);
                            });
                    });
                })
                .catch((error) => {
                    setZipFile(null);
                    setErrorMessage("Error reading zip file");
                    console.error("Failed to unzip file:", error);
                });
        }
    };

    return (
        <NodeaaContainer selected={selected} width={16} height={9}>
            <Handle type="target" position={Position.Top} id="audio" style={{ backgroundColor: "limegreen" }} />
            <NodeaaHeader nodeName="Custom Node" headerColor="bg-purple-500" />
            <div className="flex justify-between nodrag cursor-default bg-white pb-2 pt-1 px-2 h-[7rem] rounded-b-xl">
                <div className="flex flex-col">
                    <input type="file" accept=".zip" onChange={handleFileChange} />
                    {zipFile && <p>Selected file: {zipFile.name}</p>}
                    {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} id="audio" style={{ backgroundColor: "limegreen" }} />
        </NodeaaContainer>
    );
};

export default memo(FaustCustomNode);
