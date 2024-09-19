import React from 'react';
import {Background, Panel, BackgroundVariant, Position, ReactFlow, useKeyPress, useViewport} from '@xyflow/react';
import { useNodeStore } from './engine/store';
import Osc from './nodes/Osc.tsx';
import Out from './nodes/Out.tsx';

const nodeTypes = {
    osc: Osc,
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
                    onClick={() => createNode('osc')}
                    className='bg-white rounded-md font-bold'>Add Osc</button>
            </Panel>
            <Background variant={BackgroundVariant.Lines} />
        </ReactFlow>
    );
};

export default App;