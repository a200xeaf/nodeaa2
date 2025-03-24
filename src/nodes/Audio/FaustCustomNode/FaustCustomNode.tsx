import { FC, memo, useState } from "react";
import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import NodeaaContainer from "@/ui/nodes-ui/NodeaaContainer.tsx";
import NodeaaHeader from "@/ui/nodes-ui/NodeaaHeader.tsx";
import JSZip from "jszip";
import EditorPreview from "@/components/editor/editorui/EditorPreview.tsx";
import { FaustParameters } from "@/components/editor/EditorApp.tsx";

type FaustCustomNodeData = {
    faustAmp_gain: number;
    faustAmp_wet: number;
};

type FaustCustomNodeType = Node<FaustCustomNodeData, "faustCustomNode">;

const FaustCustomNode: FC<NodeProps<FaustCustomNodeType>> = ({ selected }) => {
    const [zipFile, setZipFile] = useState<File | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [parameters, setParameters] = useState<FaustParameters | null>(null);

    const logParameters = (address: string, value: unknown) => {
        console.log(address, value);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setErrorMessage(null); // clear any previous errors
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setZipFile(file);
            console.log("Selected file:", file);

            try {
                // Load the zip file asynchronously
                const zip = await JSZip.loadAsync(file);
                const allowedFiles = ["dsp-meta.json", "dsp-module.wasm"];
                const zipFiles = Object.keys(zip.files);

                // Validate that the zip contains only the allowed files
                if (zipFiles.length !== allowedFiles.length || !allowedFiles.every((name) => zipFiles.includes(name))) {
                    setZipFile(null);
                    setErrorMessage("Invalid zip");
                    console.error("Zip validation failed. Found files:", zipFiles);
                    return;
                }

                // Read dsp-meta.json and set parameters
                const metaFile = zip.file("dsp-meta.json");
                if (!metaFile) {
                    setZipFile(null);
                    setErrorMessage("dsp-meta.json not found");
                    console.error("dsp-meta.json not found in zip");
                    return;
                }

                const metaContent = await metaFile.async("string");
                console.log("dsp-meta.json content:", metaContent);

                const parsedParameters: FaustParameters = JSON.parse(metaContent);
                setParameters(parsedParameters);

                // Optionally, you can also read dsp-module.wasm
                const wasmFile = zip.file("dsp-module.wasm");
                if (wasmFile) {
                    const wasmContent = await wasmFile.async("string");
                    console.log("dsp-module.wasm content:", wasmContent);
                }
            } catch (error) {
                setZipFile(null);
                setErrorMessage("Error reading zip file");
                console.error("Failed to unzip file:", error);
            }
        }
    };

    return (
        <NodeaaContainer selected={selected} width={20} height={20}>
            <Handle type="target" position={Position.Top} id="audio" style={{ backgroundColor: "limegreen" }} />
            <NodeaaHeader nodeName="Custom Node" headerColor="bg-purple-500" />
            <div className="flex justify-between nodrag cursor-default bg-white pb-2 pt-1 px-2 h-[18rem] rounded-b-xl">
                <div className="flex flex-col">
                    <input type="file" accept=".zip" onChange={handleFileChange} />
                    {zipFile && <p>Selected file: {zipFile.name}</p>}
                    {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                    <EditorPreview parameters={parameters} updateParameter={logParameters} />
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} id="audio" style={{ backgroundColor: "limegreen" }} />
        </NodeaaContainer>
    );
};

export default memo(FaustCustomNode);
