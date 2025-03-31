import React, { useState, useRef, useEffect, useCallback, ChangeEvent, memo } from "react";
import { Node, NodeProps } from "@xyflow/react";
import { useNodeStore } from "@/engine/store"; // Adjust path if necessary
import JSZip from "jszip";
import NodeaaHeader from "@/ui/nodes-ui/NodeaaHeader"; // Adjust path if necessary
import NodeaaContainer from "@/ui/nodes-ui/NodeaaContainer"; // Adjust path if necessary

// Assuming FaustCustomNodeConfig is defined/imported correctly
export interface FaustCustomNodeConfig {
    name: string;
    metadata: object;
    wasm: string;
}

// Define the expected node data (still empty in this case)
type ImporterNodeData = Record<string, never>;

// Define the specific node type using the data type
type ImporterNodeType = Node<ImporterNodeData, "importerNode">;

const META_FILE = "dsp-meta.json";
const WASM_FILE = "dsp-module.wasm";
const EXPECTED_FILES = [META_FILE, WASM_FILE];
const SUCCESS_DISPLAY_DURATION = 3000; // 3 seconds

// Helper function to validate URL format
const isValidUrl = (urlString: string): boolean => {
    if (!urlString) return false;
    const trimmedUrl = urlString.trim();
    if (!trimmedUrl) return false;
    try {
        const url = new URL(trimmedUrl);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
        return false;
    }
};

const ImporterNode: React.FC<NodeProps<ImporterNodeType>> = ({ id, selected }) => {
    const [urlInput, setUrlInput] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null); // State for success message
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const deletionTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref to store timeout ID

    const addExternalNode = useNodeStore((state) => state.addExternalNode);
    const selfNodeDelete = useNodeStore((state) => state.selfNodeDelete);

    // Handle changes in the input field
    const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
        setUrlInput(e.target.value);
        if (errorMessage) setErrorMessage(null);
        if (successMessage) setSuccessMessage(null); // Clear success message on new input
    };

    // Function to process, validate, add node, show success, and schedule deletion
    const processUrl = useCallback(async () => {
        const trimmedUrl = urlInput.trim();
        setErrorMessage(null);
        setSuccessMessage(null); // Clear previous success message

        // --- Initial validations ---
        if (!isValidUrl(trimmedUrl)) {
            setErrorMessage("Invalid URL. Must start with http:// or https://");
            inputRef.current?.focus();
            return;
        }
        if (!trimmedUrl.toLowerCase().endsWith(".zip")) {
            setErrorMessage("URL must point to a .zip file.");
            inputRef.current?.focus();
            return;
        }

        setIsLoading(true);

        try {
            // --- Fetch and Process ZIP ---
            const response = await fetch(trimmedUrl);
            if (!response.ok) throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
            const zipBlob = await response.blob();

            const zip = new JSZip();
            const loadedZip = await zip.loadAsync(zipBlob);
            const fileNames = Object.keys(loadedZip.files).filter((name) => !loadedZip.files[name].dir);

            const hasCorrectFiles =
                fileNames.length === EXPECTED_FILES.length &&
                EXPECTED_FILES.every((expectedFile) => fileNames.includes(expectedFile));
            if (!hasCorrectFiles) {
                setErrorMessage(`ZIP must contain only ${EXPECTED_FILES.join(" and ")}.`);
                throw new Error("Incorrect files in ZIP");
            }

            // --- Extract Contents ---
            const metaFile = loadedZip.file(META_FILE);
            const wasmFile = loadedZip.file(WASM_FILE);
            if (!metaFile || !wasmFile) throw new Error(`Required files missing after check.`);

            const [metadataString, wasmBase64] = await Promise.all([
                metaFile.async("string"),
                wasmFile.async("base64"),
            ]);

            // --- Parse Metadata & Get Name ---
            let metadataObject: any;
            try {
                metadataObject = JSON.parse(metadataString);
            } catch (parseError) {
                setErrorMessage(`${META_FILE} is not valid JSON.`);
                throw new Error("Metadata JSON parsing failed");
            }
            const extractedName = metadataObject?.name;
            if (!extractedName || typeof extractedName !== "string" || !extractedName.trim()) {
                setErrorMessage(`'name' field missing or invalid in ${META_FILE}.`);
                throw new Error("Missing or invalid name in metadata");
            }
            const nodeNameKey = extractedName.trim();

            // --- Create Config & Add to Store ---
            const newNodeConfig: FaustCustomNodeConfig = {
                name: nodeNameKey,
                metadata: metadataObject,
                wasm: wasmBase64,
            };
            addExternalNode(nodeNameKey, newNodeConfig);

            // --- Success: Show message and schedule deletion ---
            setIsLoading(false); // Stop loading indicator
            setSuccessMessage(`Added: ${nodeNameKey}`); // Show success message

            // Clear any previous timeout just in case
            if (deletionTimeoutRef.current) {
                clearTimeout(deletionTimeoutRef.current);
            }

            // Schedule self-deletion
            deletionTimeoutRef.current = setTimeout(() => {
                selfNodeDelete(id);
            }, SUCCESS_DISPLAY_DURATION);

            // --- DO NOT return here, let finally run if needed ---
        } catch (error) {
            console.error("Error processing ZIP URL:", error);
            // Set error message if not already set by specific checks
            if (!errorMessage && error instanceof Error) {
                setErrorMessage(`Error: ${error.message}`);
            } else if (!errorMessage) {
                setErrorMessage("An unknown error occurred.");
            }
            // Ensure loading is stopped on error
            setIsLoading(false);
        }
        // No finally block needed specifically for setIsLoading(false) anymore,
        // as it's handled in both success and error paths explicitly.
    }, [urlInput, id, selfNodeDelete, addExternalNode, errorMessage]); // Dependencies

    // --- Effect for initial focus ---
    useEffect(() => {
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 50);
        return () => clearTimeout(timer);
    }, []);

    // --- Effect for Enter key submission ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                // Prevent submission if loading or if success message is being shown
                if (document.activeElement === inputRef.current && !isLoading && !successMessage) {
                    e.preventDefault();
                    processUrl();
                }
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [processUrl, isLoading, successMessage]); // Add successMessage dependency

    // --- Effect for Timeout Cleanup ---
    useEffect(() => {
        // Return the cleanup function
        return () => {
            // If the component unmounts, clear the deletion timeout
            if (deletionTimeoutRef.current) {
                clearTimeout(deletionTimeoutRef.current);
                console.log(`Cleared deletion timeout for importer node ${id}`); // Optional logging
            }
        };
    }, []); // Empty dependency array: runs cleanup only on unmount

    return (
        <NodeaaContainer selected={selected} width={17} height={9}>
            <NodeaaHeader nodeName="Importer" headerColor="bg-black" />
            <div className="flex flex-col justify-start nodrag cursor-default bg-white p-2 rounded-b-xl h-[7rem]">
                <label htmlFor={`url-input-${id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Paste .zip URL:
                </label>
                <input
                    id={`url-input-${id}`}
                    type="text"
                    value={urlInput}
                    onChange={handleUrlChange}
                    ref={inputRef}
                    // Disable input if loading OR if success message is shown (preventing re-submit)
                    disabled={isLoading || !!successMessage}
                    className={`w-full p-1 border rounded focus:outline-none focus:ring-1 ${
                        errorMessage
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } ${isLoading || successMessage ? "bg-gray-100 cursor-not-allowed" : ""}`} // Adjusted disabled style
                    placeholder="https://example.com/module.zip"
                    aria-invalid={!!errorMessage}
                    aria-describedby={
                        errorMessage ? `url-error-${id}` : successMessage ? `url-success-${id}` : undefined
                    }
                    aria-busy={isLoading}
                />

                {/* Status Message Area (Loading/Error/Success) */}
                <div className="h-4 mt-1 text-xs">
                    {" "}
                    {/* Container for status messages */}
                    {isLoading && <p className="text-blue-600">Processing...</p>}
                    {!isLoading && errorMessage && (
                        <p id={`url-error-${id}`} className="text-red-600" role="alert">
                            {errorMessage}
                        </p>
                    )}
                    {!isLoading && successMessage && (
                        <p id={`url-success-${id}`} className="text-green-600" role="status">
                            {" "}
                            {/* Success style */}
                            {successMessage}
                        </p>
                    )}
                </div>

                {/* Hide hint text when loading or showing success */}
                {!isLoading && !successMessage && <p className="text-xs text-gray-500 mt-1">Press Enter to submit.</p>}
            </div>
        </NodeaaContainer>
    );
};

export default memo(ImporterNode);
