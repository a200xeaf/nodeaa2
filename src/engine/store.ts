import {create} from "zustand";
import {
    Node as FlowNode,
    Edge,
    OnNodesChange,
    OnEdgesChange,
    Connection,
    applyEdgeChanges,
    applyNodeChanges, OnNodesDelete, OnEdgesDelete
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

export interface NodeStoreState {
    nodes: FlowNode[];
    edges: Edge[];

    isRunning: boolean;

    toggleAudio: () => void;
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onNodesDelete: OnNodesDelete;
    onEdgesDelete: OnEdgesDelete;
    addEdge: (data: Connection) => void;
    updateNode: (id: string, data: Partial<FlowNode['data']>) => void;
    createNode: (type: string) => void;
}

export const useNodeStore = create<NodeStoreState>((set, get) => ({
    nodes: [
        {id: 'output', type: 'out', data: {label: 'output'}, position: {x: 500, y: 500}}
    ],
    edges: [],

    isRunning: isRunningEngine(),

    createNode: (type) => {
        const id = nanoid()

        switch(type) {
            case 'osc': {
                const data = { frequency: 200, type: 'sine' };
                const position = { x: 0, y: 0 };

                createAudioNode(id, type, data)
                set({ nodes: [...get().nodes, { id, type, data, position }] })

                break
            }

            case 'gain': {
                const data = { gain_gain: 1.0 };
                const position = { x: 0, y: 0 };

                createAudioNode(id, type, data)
                set({ nodes: [...get().nodes, { id, type, data, position }] })

                break
            }

            case 'osc2': {
                const data = { osc_frequency: 440, type: 0 };
                const position = { x: 0, y: 0 };

                createAudioNode(id, type, data)
                set({ nodes: [...get().nodes, { id, type, data, position }] })

                break
            }
        }
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
    addEdge: (data) => {
        const id = nanoid(6)
        const edge = {id, ...data}
        set({edges: [edge, ...get().edges]})
        connectNodes(data.source, data.target)
    },
    updateNode: (id, data) => {
        updateAudioNode(id, data)
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
            deleteAudioNode(id)
        }
    },
    onEdgesDelete: (edges) => {
        for (const edge of edges) {
            disconnectNodes(edge.source, edge.target)
        }
    }
}))