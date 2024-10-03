import React from 'react';
import {Background, Panel, BackgroundVariant, ReactFlow, Connection, Edge} from '@xyflow/react';
import { useNodeStore } from './engine/store';
import OutNode from './nodes/OutNode/OutNode.tsx';
import FaustGainNode from "./nodes/FaustGainNode/FaustGainNode.tsx";
import FaustPolyNode from "./nodes/FaustPolyNode/FaustPolyNode.tsx";
import Osc2Node from "./nodes/Osc2Node/Osc2Node.tsx";
import MidiInNode from "./nodes/MidiInNode/MidiInNode.tsx";
import NumberNode from "./nodes/NumberNode/NumberNode.tsx";
import ViewerNode from "./nodes/ViewerNode/ViewerNode.tsx";
import {useShallow} from "zustand/react/shallow";
import AnimatedGreenDashedEdge from "./ui/edges/AnimatedGreenDashedEdge.tsx";
import SolidBlueEdge from "./ui/edges/SolidBlueEdge.tsx";

const nodeTypes = {
    osc2Node: Osc2Node,
    faustGainNode: FaustGainNode,
    faustPolyNode: FaustPolyNode,
    outNode: OutNode,
    midiInNode: MidiInNode,
    numberNode: NumberNode,
    viewerNode: ViewerNode,
};

const edgeTypes = {
    solidBlueEdge: SolidBlueEdge,
    animatedGreenDashedEdge: AnimatedGreenDashedEdge,
};

const isValidConnection = (connectionOrEdge: Connection | Edge): boolean => {
    const { sourceHandle, targetHandle } = connectionOrEdge;
    if (sourceHandle === targetHandle) {
        return true;
    }
    if (sourceHandle?.startsWith("data-") && targetHandle?.startsWith("data")) {
        return true;
    }
    if (sourceHandle?.startsWith("midi-") && targetHandle?.startsWith("midi")) {
        return true;
    }
    return false;
};

const App: React.FC = () => {
    const nodes = useNodeStore(useShallow((state) => state.nodes));
    const edges = useNodeStore(useShallow((state) => state.edges));

    const onNodesChange = useNodeStore(useShallow((state) => state.onNodesChange));
    const onEdgesChange = useNodeStore(useShallow((state) => state.onEdgesChange));
    const onNodesDelete = useNodeStore(useShallow((state) => state.onNodesDelete));
    const onEdgesDelete = useNodeStore(useShallow((state) => state.onEdgesDelete));

    const onConnect = useNodeStore(useShallow((state) => state.onConnect));
    const createNode = useNodeStore(useShallow((state) => state.createNode));

    // const { x, y, zoom } = useViewport();
    // const nPressed = useKeyPress('n')
    // console.log(x,y,zoom)
    // console.log(nPressed)

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}

            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}

            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}

            onConnect={onConnect}

            isValidConnection={isValidConnection}
        >
            <Panel position={'top-left'}>
                <button
                    onClick={() => createNode('faustGainNode')}
                    className='bg-white rounded-md font-bold p-2'>Add Faust Gain
                </button>
                <button
                    onClick={() => createNode('faustPolyNode')}
                    className='bg-white rounded-md font-bold p-2'>Add Faust Poly
                </button>
                <button
                    onClick={() => createNode('osc2Node')}
                    className='bg-white rounded-md font-bold p-2'>Add Osc2
                </button>
                <button
                    onClick={() => createNode('midiInNode')}
                    className='bg-white rounded-md font-bold p-2'>Add Midi In
                </button>
                <button
                    onClick={() => createNode('numberNode')}
                    className='bg-white rounded-md font-bold p-2'>Add Number Node
                </button>
                <button
                    onClick={() => createNode('viewerNode')}
                    className='bg-white rounded-md font-bold p-2'>Add Viewer Node
                </button>
            </Panel>
            <Background variant={BackgroundVariant.Lines}/>
        </ReactFlow>
    );
};

export default App;