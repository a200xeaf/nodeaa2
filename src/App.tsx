import React from 'react';
import {Background, Panel, BackgroundVariant, ReactFlow, Connection, Edge} from '@xyflow/react';
import { useNodeStore } from './engine/store';
import Out from './nodes/Out/Out.tsx';
import Gain from "./nodes/Gain/Gain.tsx";
import Osc2 from "./nodes/Osc2/Osc2.tsx";
import MidiIn from "./nodes/MidiIn/MidiIn.tsx";
import NumberNode from "./nodes/Number/Number.tsx";
import {useShallow} from "zustand/react/shallow";

const nodeTypes = {
    osc2: Osc2,
    gain: Gain,
    out: Out,
    midiin: MidiIn,
    numberNode: NumberNode,
};

const App: React.FC = () => {
    const nodes = useNodeStore(useShallow((state) => state.nodes));
    const edges = useNodeStore(useShallow((state) => state.edges));

    const onNodesChange = useNodeStore(useShallow((state) => state.onNodesChange));
    const onEdgesChange = useNodeStore(useShallow((state) => state.onEdgesChange));
    const onNodesDelete = useNodeStore(useShallow((state) => state.onNodesDelete));
    const onEdgesDelete = useNodeStore(useShallow((state) => state.onEdgesDelete));

    const addEdge = useNodeStore(useShallow((state) => state.addEdge));
    const createNode = useNodeStore(useShallow((state) => state.createNode));

    const isValidConnection = (connectionOrEdge: Connection | Edge): boolean => {
        if (connectionOrEdge.sourceHandle === connectionOrEdge.targetHandle) {
            return true
        } else {
            return false
        }
    }

    // const { x, y, zoom } = useViewport();
    // const nPressed = useKeyPress('n')
    // console.log(x,y,zoom)
    // console.log(nPressed)

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}

            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onEdgesDelete={onEdgesDelete}
            onConnect={addEdge}
            onNodesDelete={onNodesDelete}

            isValidConnection={isValidConnection}
        >
            <Panel position={'top-left'}>
                <button
                    onClick={() => createNode('gain')}
                    className='bg-white rounded-md font-bold p-2'>Add Gain
                </button>
                <button
                    onClick={() => createNode('osc2')}
                    className='bg-white rounded-md font-bold p-2'>Add Osc2
                </button>
                <button
                    onClick={() => createNode('midiin')}
                    className='bg-white rounded-md font-bold p-2'>Add Midi In
                </button>
                <button
                    onClick={() => createNode('numberNode')}
                    className='bg-white rounded-md font-bold p-2'>Add Number Node
                </button>
            </Panel>
            <Background variant={BackgroundVariant.Lines}/>
        </ReactFlow>
    );
};

export default App;