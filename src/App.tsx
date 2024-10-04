import {Background, BackgroundVariant, ReactFlow, Connection, Edge, useViewport} from '@xyflow/react';
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
import NodeToolbarMenu from "@/ui/NodeToolbarMenu.tsx";

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

const getBackgroundVariant = (selection: string): BackgroundVariant | undefined => {
    switch (selection) {
        case 'lines':
            return BackgroundVariant.Lines;
        case 'dots':
            return BackgroundVariant.Dots;
        case 'crosses':
            return BackgroundVariant.Cross;
        default:
            return undefined;  // Handle unexpected values
    }
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

    const graphBackground = useNodeStore(useShallow((state) => state.graphBackground));

    const { x, y, zoom } = useViewport();

    // const { x, y, zoom } = useViewport();
    // const nPressed = useKeyPress('n')
    // console.log(x,y,zoom)
    // console.log(nPressed)

    return (
        <div style={{width: '100vw', height: '100vh'}}>
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
                <Background variant={getBackgroundVariant(graphBackground)} gap={28} />
            </ReactFlow>
            {/*<div className='absolute z-[9999] h-screen w-screen top-0 left-0'>*/}
            {/*    <NodeContextMenu />*/}
            {/*</div>*/}
            <NodeToolbarMenu />
            <p className='z-[9999] absolute top-0 right-0 bg-white p-2 rounded-xl drop-shadow-lg m-2'>{x.toFixed(2)}, {y.toFixed(2)}, {zoom.toFixed(2)}</p>
        </div>
    );
};

export default App;