import {create} from "zustand";
import {
    Node as FlowNode,
    Edge,
    OnNodesChange,
    OnEdgesChange,
    Connection,
    applyEdgeChanges,
    applyNodeChanges, OnNodesDelete, OnEdgesDelete, OnConnect
} from "@xyflow/react";
import {nanoid} from "nanoid";
import {
    connectNodes,
    createAudioNode,
    deleteAudioNode,
    disconnectNodes,
    isRunningEngine,
    toggleAudioEngine,
    updateAudioNode
} from "./audio.ts";
import {WebMidi} from "webmidi";
import rawNodesConfig from './nodes.json'
import {NodesConfig} from "@/engine/types.ts";

export interface NodeStoreState {
    nodes: FlowNode[];
    edges: Edge[];

    viewport: {
        x: number
        y: number
        zoom: number
    }
    setViewport: (x: number, y: number, zoom: number) => void

    wm: typeof WebMidi;

    isRunning: boolean;

    toggleAudio: () => void;
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onNodesDelete: OnNodesDelete;
    onEdgesDelete: OnEdgesDelete;
    selfNodeDelete: (id: string) => void
    onConnect: OnConnect;
    updateNode: (id: string, data: Partial<FlowNode['data']>) => void;
    createNode: (type: string, pos?: {x: number, y: number}, center?: boolean) => void;

    graphBackground: string
    setGraphBackground: (selection: string) => void

    isFullscreen: boolean;
    toggleFullscreen: () => void;
    setFullscreen: (state: boolean) => void;
}

const nodesConfig: NodesConfig = rawNodesConfig as NodesConfig;

export const useNodeStore = create<NodeStoreState>((set, get) => ({
    nodes: [
        {id: 'output-1', type: 'outNode', data: {label: 'output'}, position: {x: 800, y: 500}}
    ],
    edges: [],

    viewport: {
        x: 0,
        y: 0,
        zoom: 1,
    },
    setViewport: (x: number, y: number, zoom: number)=> {
        set({viewport: {x, y, zoom}});
    },

    wm: WebMidi,

    isRunning: isRunningEngine(),

    createNode: (type, pos = {x: 0, y: 0}, center = false) => {
        const nodeConfig = nodesConfig[type];

        // If the type is not found in the config, exit the function
        if (!nodeConfig) {
            console.error(`Node type '${type}' not found in configuration.`);
            return;  // Early exit
        }

        // Generate a unique ID for the node
        let id: string
        if (nodeConfig.idPrefix === "") {
            id = nanoid()
        } else {
            id = `${nodeConfig.idPrefix}-${nanoid()}`
        }
        const data = nodeConfig.defaultData;

        let position
        //FIXME Perfect this based on node size (add to json?)
        if (center) {
            position = {
                x: (window.innerWidth / 2 - get().viewport.x - 150) / get().viewport.zoom,
                y: (window.innerHeight / 2 - get().viewport.y - 100) / get().viewport.zoom,
            }
        } else {
            position = { x: pos.x, y: pos.y }
        }

        // Create audio node if required
        if (nodeConfig.hasAudio && nodeConfig.audioNodeParams) {
            const { engine, type: audioType, voices } = nodeConfig.audioNodeParams;
            createAudioNode(id, engine, audioType, data, voices);
        }

        // Add the new node to the store
        set({ nodes: [...get().nodes, { id, type, data, position }] });

        // console.log(`Node '${nodeConfig.realName}' (ID: ${id}) created at position`, position);
    },
    toggleAudio: () => {
        toggleAudioEngine().then(() => {
            set({isRunning: isRunningEngine()});
        })
    },
    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes)
        })
    },
    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges)
        })
    },
    onConnect: (connection: Connection) => {
        const id = nanoid(6);

        // Determine the edge type based on the targetHandle
        const edgeType = connection.targetHandle?.startsWith("midi")
            ? "solidBlueEdge"
            : "animatedGreenDashedEdge";

        const newEdge = {
            id,
            ...connection,
            type: edgeType,  // Set the edge type dynamically
        };

        set({ edges: [newEdge, ...get().edges] });

        // Additional logic for connecting audio nodes
        if (connection.sourceHandle === 'audio') {
            connectNodes(connection.source, connection.target);
        }
    },
    updateNode: (id, data) => {
        if (!(id.length > 21)) {
            updateAudioNode(id, data)
        }
        set({
            nodes: get().nodes.map((node) =>
                node.id === id
                    ? {...node, data: {...node.data, ...data}}
                    : node
            ),
        });
    },
    onNodesDelete: (nodes) => {
        for (const {id} of nodes) {
            if (!(id.length > 21)) {
                deleteAudioNode(id)
            }
        }
    },
    onEdgesDelete: (edges) => {
        for (const edge of edges) {
            if (edge.sourceHandle === 'audio') {
                disconnectNodes(edge.source, edge.target)
            }
        }
    },
    selfNodeDelete: (id) => {
        set({
            nodes: get().nodes.filter(node => node.id !== id)  // Remove node by filtering out the one with the given id
        });
    },
    graphBackground: "lines",
    setGraphBackground: (selection: string) => set({ graphBackground: selection }),
    isFullscreen: Boolean(document.fullscreenElement),
    toggleFullscreen: () => {
        if (!document.fullscreenElement) {
            document.body.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    },
    setFullscreen: (state: boolean) => {
        set({isFullscreen: state});
    }
}))