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
        {id: 'output-1', type: 'outNode', data: {label: 'output'}, position: {x: 500, y: 500}}
    ],
    edges: [],

    wm: WebMidi,

    isRunning: isRunningEngine(),

    createNode: (type) => {
        let id: string

        switch(type) {
            case 'osc2Node': {
                id = nanoid()
                const data = { osc_frequency: 440, osc_type: 1 };
                const position = { x: 0, y: 0 };

                createAudioNode(id, "rnbo", "osc2", data)
                set({ nodes: [...get().nodes, { id, type, data, position }] })

                break
            }

            case 'faustGainNode': {
                id = nanoid()
                const data = { faustgain_Gain: 1 };
                const position = { x: 0, y: 0 };

                createAudioNode(id, "faust", "faustgain", data)
                set({ nodes: [...get().nodes, { id, type, data, position }] })

                break
            }

            case 'faustPolyNode': {
                id = nanoid()
                const data = {
                    faustpoly_attack: 0.1,
                    faustpoly_decay: 0.1,
                    faustpoly_sustain: 0.7,
                    faustpoly_release: 0.1,
                    faustpoly_waveformsel: 0
                };
                const position = { x: Math.random()*500, y: Math.random()*500 };

                createAudioNode(id, "faust", "faustpoly", data, 16)
                set({ nodes: [...get().nodes, { id, type, data, position }] })

                break
            }

            case 'midiInNode': {
                id = "data-" + nanoid()
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

            case 'viewerNode': {
                id = "data-" + nanoid()
                const data = { viewer_value: "" };
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
    }
}))