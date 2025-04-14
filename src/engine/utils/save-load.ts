import { useNodeStore } from "@/engine/store.ts";
import { saveAs } from "file-saver";
import { ProjectData } from "@/engine/types/save-types.ts";
import JSZip from "jszip";

export const projectNew = () => {
    if (useNodeStore.getState().isRecording) {
        useNodeStore.getState().setIsRecording(false);
    }
    useNodeStore.getState().clearProject();

    //FINAL
    useNodeStore.setState({
        ...useNodeStore.getInitialState(), // Reset to initial state
        welcomeDialog: false, // Override welcomeDialog to false
    });
};

export const projectSave = () => {
    const storeState = useNodeStore.getState();

    const savedProject = JSON.stringify({
        nodes: storeState.nodes,
        edges: storeState.edges,
        viewport: storeState.viewport,
        graphBackground: storeState.graphBackground,
        externalNodeLinks: storeState.externalNodeLinks,
    });

    const savedProjectBlob = new Blob([savedProject], {
        type: "application/json",
    });
    saveAs(savedProjectBlob, "NewProject.nodeaa");
};

export const projectLoad = async (
    savedProjectJSON: string,
): Promise<{
    success: boolean;
    viewport: { x: number; y: number; zoom: number } | null;
}> => {
    if (useNodeStore.getState().isRecording) {
        useNodeStore.getState().setIsRecording(false);
    }

    useNodeStore.getState().clearProject();
    useNodeStore.setState({ loadingProgress: 0 });
    useNodeStore.setState({ loadingStatus: true });
    try {
        const savedProject = JSON.parse(savedProjectJSON) as ProjectData;
        const { nodes, edges, viewport, graphBackground, externalNodeLinks } = savedProject;

        await processAndAddNodesFromUrlsOrFailFast(externalNodeLinks);

        const nodesCount = nodes.length;
        const edgesCount = edges.length;
        const totalTasks = nodesCount + edgesCount + 1;
        let completedTasks = 0;

        const updateProgress = () => {
            completedTasks += 1;
            const progress = Math.round((completedTasks / totalTasks) * 100);
            useNodeStore.setState({ loadingProgress: progress });
        };

        interface EdgeStatus {
            source: string;
            target: string;
        }

        const updateStatus = (status: { phase: string; data: string | EdgeStatus }) => {
            if (status.phase === "node") {
                useNodeStore.setState({
                    loadingMessage: `Loading Node: ${status.data}`,
                });
            } else if (status.phase === "edge") {
                const connectionData = status.data as EdgeStatus;
                useNodeStore.setState({
                    loadingMessage: `Connecting ${connectionData.source} to ${connectionData.target}`,
                });
            } else {
                useNodeStore.setState({
                    loadingMessage: `Setting Background to: ${status.data}`,
                });
            }
        };

        for (const node of nodes) {
            updateStatus({ phase: "node", data: node.type });
            if (node.type === "faustCustomNode") {
                await useNodeStore
                    .getState()
                    //@ts-expect-error complicated type
                    .createCustomNode(node.data.customNodeMetadata.name, node.position, node.id);
                //@ts-expect-error complicated type
                useNodeStore.getState().updateCustomNode(node.id, node.data.parameters);
            } else {
                await useNodeStore.getState().createNode(node.type, node.position, false, node.id);
                //@ts-expect-error complicated type
                useNodeStore.getState().updateNode(node.id, node.data);
            }
            updateProgress();
        }

        edges.forEach((edge) => {
            updateStatus({
                phase: "edge",
                data: { source: edge.source, target: edge.target },
            });
            if (!edge.source.startsWith("mic")) {
                useNodeStore.getState().onConnect({
                    source: edge.source,
                    sourceHandle: edge.sourceHandle,
                    target: edge.target,
                    targetHandle: edge.targetHandle,
                });
            }
            updateProgress();
        });

        updateStatus({ phase: "background", data: graphBackground });
        useNodeStore.getState().setGraphBackground(graphBackground);
        updateProgress();
        useNodeStore.setState({ loadingStatus: false });
        useNodeStore.setState({ loadingProgress: 0 });
        console.log("VIEWPORT", viewport);
        return { success: true, viewport: viewport || { x: 0, y: 0, zoom: 1 } };
    } catch (error) {
        console.error("Error parsing or loading project:", error);
        useNodeStore.setState({ loadingStatus: false });
        useNodeStore.setState({ loadingProgress: 0 });
        return { success: false, viewport: null };
    }
};

/**
 * Processes an array of URLs, fetching ZIP files, validating contents,
 * extracting data, and adding valid nodes using the 'addExternalNode' function
 * available in the current scope.
 *
 * Hardcoded to expect 'metadata.json' and 'faust.wasm' files.
 * Throws an error immediately if any step fails for any URL, halting the process.
 *
 * @param urls - An array of URL strings to process.
 * @throws {Error} If any URL fails fetching, validation, or processing. The error message
 *                 will indicate the URL and the cause of the failure.
 * @returns {Promise<void>} A promise that resolves if *all* URLs are processed successfully.
 */
async function processAndAddNodesFromUrlsOrFailFast(urls: string[]): Promise<void> {
    // 1. Hardcoded expected file names
    const EXPECTED_FILES = ["dsp-meta.json", "dsp-module.wasm"] as const; // Use 'as const' for stricter typing if using TS
    const META_FILE = "dsp-meta.json";
    const WASM_FILE = "dsp-module.wasm";

    // 2. Process each URL sequentially. Error in any step will stop the loop and throw.
    for (const urlInput of urls) {
        // --- Basic Input Validation ---
        if (!urlInput || typeof urlInput !== "string") {
            console.warn("Skipping invalid URL entry (non-string or empty):", urlInput);
            continue; // Skip this entry and proceed to the next
        }
        const trimmedUrl = urlInput.trim();
        if (!trimmedUrl) {
            console.warn("Skipping empty URL string after trimming.");
            continue; // Skip this entry and proceed to the next
        }

        console.log(`Processing URL: ${trimmedUrl}`);

        // The following operations are implicitly wrapped in the overall function's
        // async nature. If any `await` rejects or an explicit `throw` occurs,
        // the promise returned by this function will reject.

        // --- Fetch ZIP ---
        const response = await fetch(trimmedUrl);
        if (!response.ok) {
            // 3. Throw error on fetch failure
            throw new Error(`Fetch failed for ${trimmedUrl}: ${response.status} ${response.statusText}`);
        }
        const zipBlob = await response.blob();

        // --- Load & Validate ZIP ---
        const zip = new JSZip();
        const loadedZip = await zip.loadAsync(zipBlob);
        const fileNames = Object.keys(loadedZip.files).filter((name) => !loadedZip.files[name].dir);

        const hasCorrectFiles =
            fileNames.length === EXPECTED_FILES.length &&
            EXPECTED_FILES.every((expectedFile) => fileNames.includes(expectedFile));

        if (!hasCorrectFiles) {
            // 3. Throw error on incorrect file structure
            throw new Error(`ZIP from ${trimmedUrl} must contain only ${EXPECTED_FILES.join(" and ")}.`);
        }

        // --- Extract Contents ---
        const metaFile = loadedZip.file(META_FILE);
        const wasmFile = loadedZip.file(WASM_FILE);

        // This check is slightly redundant due to hasCorrectFiles, but good for robustness
        if (!metaFile || !wasmFile) {
            throw new Error(
                `Required files (${META_FILE}, ${WASM_FILE}) missing from ${trimmedUrl} despite passing initial check.`,
            );
        }

        // Using Promise.all to fetch contents concurrently
        const [metadataString, wasmBase64] = await Promise.all([metaFile.async("string"), wasmFile.async("base64")]);

        // --- Parse Metadata & Get Name ---
        let metadataObject: any;
        try {
            metadataObject = JSON.parse(metadataString);
        } catch (parseError: any) {
            // 3. Throw error on JSON parsing failure
            throw new Error(`${META_FILE} from ${trimmedUrl} is not valid JSON: ${parseError.message}`);
        }

        const extractedName = metadataObject?.name;
        if (!extractedName || typeof extractedName !== "string" || !extractedName.trim()) {
            // 3. Throw error on missing/invalid name
            throw new Error(`'name' field missing or invalid in ${META_FILE} from ${trimmedUrl}.`);
        }
        const nodeNameKey = extractedName.trim();

        // --- Create Config & Add to Store ---
        const newNodeConfig /*: FaustCustomNodeConfig */ = {
            // Add TS type if using it
            name: nodeNameKey,
            metadata: metadataObject,
            wasm: wasmBase64,
        };

        console.log(`Successfully processed ${trimmedUrl}. Adding node: ${nodeNameKey}`);
        // 4. Assume addExternalNode is available in scope and call it
        useNodeStore.getState().addExternalNode(nodeNameKey, newNodeConfig);
    } // End of for loop

    console.log("Finished processing all URLs successfully.");
    // If the loop completes without error, the promise resolves successfully.
}
