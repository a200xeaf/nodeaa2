import React from 'react'
import {useNodeStore} from "../../engine/store.ts";
import {useShallow} from "zustand/react/shallow";
import {Handle, Position, Node, NodeProps, useHandleConnections} from "@xyflow/react";
import {useEmitterSubscriptions} from "@/engine/utils/hooks/useEmitterSubscription.ts";
import NodeaaContainer from "@/ui/nodes-ui/NodeaaContainer.tsx";
import NodeaaHeader from "@/ui/nodes-ui/NodeaaHeader.tsx";

// Define the node data structure
type ViewerNodeData = { viewer_value: never };

// Create a custom node type
type ViewerNodeType = Node<ViewerNodeData, 'viewerNode'>;

const NumberNode: React.FC<NodeProps<ViewerNodeType>> = ({id, data, selected}) => {
    const dataConnections = useHandleConnections({type: 'target', id: 'data'})
    const updateNode = useNodeStore(useShallow((state) => state.updateNode));

    const handleViewer = (e: unknown) => {
        updateNode(id, {viewer_value: e});
    }

    useEmitterSubscriptions({
        connections: dataConnections,
        callback: handleViewer,
        data
    })

    return (
        <NodeaaContainer selected={selected} width={15} height={6}>
            <Handle type='target' position={Position.Top} id='data' style={{ backgroundColor: 'grey' }}/>
            <NodeaaHeader nodeName='Viewer' headerColor='bg-gray-500' />
            <div className='flex flex-col w-full h-[4rem] bg-white justify-center items-center px-2 rounded-b-xl'>
                <div
                    className='w-full overflow-x-auto whitespace-nowrap'
                    style={{maxHeight: '3rem', overflowY: 'hidden'}}
                >
                    <p>Value: {data.viewer_value}</p>
                </div>
                <p className='text-xs'>ID: {id}</p>
            </div>
        </NodeaaContainer>
    )
}
export default NumberNode
