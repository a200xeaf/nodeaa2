import {FC, memo} from 'react'
import {useNodeStore} from "@/engine/store.ts";
import {Handle, Node, NodeProps, Position} from "@xyflow/react";
import {useShallow} from "zustand/react/shallow";
import NodeaaContainer from "@/ui/nodes-ui/NodeaaContainer.tsx";
import NodeaaHeader from "@/ui/nodes-ui/NodeaaHeader.tsx";

type OutNodeType = Node<Record<string, never>, 'outNode'>;

const OutNode: FC<NodeProps<OutNodeType>> = ({selected}) => {
    const isRunning = useNodeStore(useShallow((state) => state.isRunning));
    const toggleAudio = useNodeStore(useShallow((state) => state.toggleAudio));

    return (
        <NodeaaContainer selected={selected} width={7} height={6}>
            <Handle type="target" position={Position.Top} id="audio"/>
            <NodeaaHeader nodeName='Audio Out' headerColor='bg-blue-500' />
            <div className='flex flex-col nodrag cursor-default bg-white p-2 h-[4rem] justify-center items-center rounded-b-xl'>
                <label>
                    <button
                        onClick={toggleAudio}
                        className={`font-bold text-center p-1 text-sm ${isRunning ? 'bg-green-500' : 'bg-red-500'}`}>
                        {isRunning ? (
                            <span className='text-white'>Running</span>
                        ) : (
                            <span className='text-black'>Not running</span>
                        )}
                    </button>
                </label>
            </div>
        </NodeaaContainer>
    )
}
export default memo(OutNode)
