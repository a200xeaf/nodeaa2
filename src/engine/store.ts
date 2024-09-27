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

export interface NodeStoreState {
    nodes: FlowNode[];
    edges: Edge[];

    wm: typeof WebMidi;

    isRunning: boolean;

    toggleAudio: () => void;
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onNodesDelete: OnNodesDelete;
    onEdgesDelete: OnEdgesDelete;
    onConnect: OnConnect;
    updateNode: (id: string, data: Partial<FlowNode['data']>) => void;
    createNode: (type: string) => void;
}

export const useNodeStore = create<NodeStoreState>((set, get) => ({
    nodes: [
        {id: 'output', type: 'outNode', data: {label: 'output'}, position: {x: 500, y: 500}}
    ],
    edges: [],

    wm: WebMidi,

    isRunning: isRunningEngine(),

    createNode: (type) => {
        let id: string

        switch(type) {
            case 'osc': {
                id = nanoid()
                const data = { frequency: 200, type: 'sine' };
                const position = { x: 0, y: 0 };

                createAudioNode(id, type, data)
                set({ nodes: [...get().nodes, { id, type, data, position }] })

                break
            }

            case 'gainNode': {
                id = nanoid()
                const data = { gain_gain: 1.0 };
                const position = { x: 0, y: 0 };

                createAudioNode(id, type, data)
                set({ nodes: [...get().nodes, { id, type, data, position }] })

                break
            }

            case 'osc2Node': {
                id = nanoid()
                const data = { osc_frequency: 440, osc_type: 1 };
                const position = { x: 0, y: 0 };

                createAudioNode(id, type, data)
                set({ nodes: [...get().nodes, { id, type, data, position }] })

                break
            }

            case 'midiInNode': {
                id = "midi-" + nanoid()
                const data = { midiin_device: "" };
                const position = { x: 0, y: 0 };

                set({ nodes: [...get().nodes, { id, type, data, position }] })

                break
            }

            case 'numberNode': {
                id = "data-" + nanoid()
                const data = { number_number: 0 };
                const position = { x: 0, y: 0 };

                set({ nodes: [...get().nodes, { id, type, data, position }] })

                break
            }

            default: {
                throw new Error("Called device that doesn't exist")
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
    onConnect: (connection: Connection) => {
        const id = nanoid(6)
        const newEdge = {id, ...connection}
        set({edges: [newEdge, ...get().edges]})
        if (connection.sourceHandle === 'audio') {
            connectNodes(connection.source, connection.target)
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
    }
}))