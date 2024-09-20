import React from 'react';
import {Background, Panel, BackgroundVariant, ReactFlow} from '@xyflow/react';
import { useNodeStore } from './engine/store';
import Out from './nodes/Out/Out.tsx';
import Gain from "./nodes/Gain/Gain.tsx";
import Osc2 from "./nodes/Osc2/Osc2.tsx";

const nodeTypes = {
    osc2: Osc2,
    gain: Gain,
    out: Out,
};

const App: React.FC = () => {
    const nodes = useNodeStore((state) => state.nodes);
    const edges = useNodeStore((state) => state.edges);

    const onNodesChange = useNodeStore((state) => state.onNodesChange);
    const onEdgesChange = useNodeStore((state) => state.onEdgesChange);
    const onNodesDelete = useNodeStore((state) => state.onNodesDelete);
    const onEdgesDelete = useNodeStore((state) => state.onEdgesDelete);

    const addEdge = useNodeStore((state) => state.addEdge);
    const createNode = useNodeStore((state) => state.createNode);

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
            </Panel>
            <Background variant={BackgroundVariant.Lines}/>
        </ReactFlow>
    );
};

export default App;