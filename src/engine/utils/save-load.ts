import {useNodeStore} from "@/engine/store.ts";
import {saveAs} from "file-saver";
import {ProjectData} from "@/engine/types/save-types.ts";

export const projectNew = () => {
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
    useNodeStore.getState().clearProject()
    try {
        const savedProject = JSON.parse(savedProjectJSON) as ProjectData;
        const { nodes, edges, viewport, graphBackground } = savedProject;

        for (const node of nodes) {
            await useNodeStore.getState().createNode(node.type, node.position, false, node.id);
            useNodeStore.getState().updateNode(node.id, node.data);
        }

        edges.forEach(edge => {
            useNodeStore.getState().onConnect({source: edge.source, sourceHandle: edge.sourceHandle, target: edge.target, targetHandle: edge.targetHandle});
        })

        useNodeStore.getState().setGraphBackground(graphBackground);

        return { success: true, viewport: viewport || { x: 0, y: 0, zoom: 1 } };
    } catch (error) {
        console.error("Error parsing or loading project:", error);
        return { success: false, viewport: null };
    }
};