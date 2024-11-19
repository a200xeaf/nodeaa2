import {useNodeStore} from "@/engine/store.ts";
import {saveAs} from "file-saver";
import {ProjectData} from "@/engine/types/save-types.ts";

export const projectNew = () => {
    if (useNodeStore.getState().isRecording) {
        useNodeStore.getState().setIsRecording(false);
    }
    useNodeStore.getState().clearProject()

    //FINAL
    useNodeStore.setState({
        ...useNodeStore.getInitialState(),  // Reset to initial state
        welcomeDialog: false,               // Override welcomeDialog to false
    });
}

export const projectSave = () => {
    const storeState  = useNodeStore.getState()

    const savedProject = JSON.stringify({
        nodes: storeState.nodes,
        edges: storeState.edges,
        viewport: storeState.viewport,
        graphBackground: storeState.graphBackground,
    })

    const savedProjectBlob = new Blob([savedProject], { type: 'application/json' });
    saveAs(savedProjectBlob, 'NewProject.nodeaa');
}

export const projectLoad = async (savedProjectJSON: string): Promise<{ success: boolean; viewport: { x: number; y: number; zoom: number } | null }> => {
    if (useNodeStore.getState().isRecording) {
        useNodeStore.getState().setIsRecording(false);
    }

    useNodeStore.getState().clearProject()
    useNodeStore.setState({loadingProgress: 0})
    useNodeStore.setState({loadingStatus: true})
    try {
        const savedProject = JSON.parse(savedProjectJSON) as ProjectData;
        const { nodes, edges, viewport, graphBackground } = savedProject;

        const nodesCount = nodes.length;
        const edgesCount = edges.length;
        const totalTasks = nodesCount + edgesCount + 1
        let completedTasks = 0

        const updateProgress = () => {
            completedTasks += 1
            const progress = Math.round((completedTasks / totalTasks) * 100)
            useNodeStore.setState({loadingProgress: progress})
        }

        interface EdgeStatus {
            source: string
            target: string
        }

        const updateStatus = (status: {phase: string, data: string | EdgeStatus}) => {
            if (status.phase === 'node') {
                useNodeStore.setState({loadingMessage: `Loading Node: ${status.data}`})
            } else if (status.phase === 'edge') {
                const connectionData = status.data as EdgeStatus;
                useNodeStore.setState({loadingMessage: `Connecting ${connectionData.source} to ${connectionData.target}`})
            } else {
                useNodeStore.setState({loadingMessage: `Setting Background to: ${status.data}`})
            }
        }

        for (const node of nodes) {
            updateStatus({phase: "node", data: node.type})
            await useNodeStore.getState().createNode(node.type, node.position, false, node.id);
            useNodeStore.getState().updateNode(node.id, node.data);
            updateProgress()
        }

        edges.forEach(edge => {
            updateStatus({phase: "edge", data: {source: edge.source, target: edge.target}})
            useNodeStore.getState().onConnect({source: edge.source, sourceHandle: edge.sourceHandle, target: edge.target, targetHandle: edge.targetHandle});
            updateProgress()
        })

        updateStatus({phase: "background", data: graphBackground})
        useNodeStore.getState().setGraphBackground(graphBackground);
        updateProgress()
        useNodeStore.setState({loadingStatus: false})
        useNodeStore.setState({loadingProgress: 0})
        return { success: true, viewport: viewport || { x: 0, y: 0, zoom: 1 } };
    } catch (error) {
        console.error("Error parsing or loading project:", error);
        useNodeStore.setState({loadingStatus: false})
        useNodeStore.setState({loadingProgress: 0})
        return { success: false, viewport: null };
    }
};