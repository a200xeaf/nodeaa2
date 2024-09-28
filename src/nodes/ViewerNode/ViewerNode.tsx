import React from 'react'
import {useNodeStore} from "../../engine/store.ts";
import {useShallow} from "zustand/react/shallow";
import {Handle, Position, Node, NodeProps, useHandleConnections} from "@xyflow/react";
import {useEmitterSubscriptions} from "../../hooks/useEmitterSubscription.ts";

// Define the node data structure
type ViewerNodeData = { viewer_value: never };

// Create a custom node type
type ViewerNodeType = Node<ViewerNodeData, 'viewerNode'>;

const NumberNode: React.FC<NodeProps<ViewerNodeType>> = ({id, data}) => {
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
        <div className='w-60 h-[6rem] drop-shadow-lg'>
            <Handle type='target' position={Position.Top} id='data' style={{ backgroundColor: 'grey' }}/>
            <div className='flex items-center bg-gray-500 h-[2rem] px-1'>
                <p className='font-bold text-white'>Viewer</p>
            </div>
            <div className='flex flex-col w-full h-[4rem] bg-white justify-center items-center px-2'>
                <div
                    className='w-full overflow-x-auto whitespace-nowrap'
                    style={{maxHeight: '3rem', overflowY: 'hidden'}}
                >
                    <p>Value: {data.viewer_value}</p>
                </div>
                <p className='text-xs'>ID: {id}</p>
            </div>
        </div>
    )
}
export default NumberNode
