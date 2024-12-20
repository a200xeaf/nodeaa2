import {FC, memo, useEffect} from 'react'
import {useNodeStore} from "@/engine/store.ts";
import {Handle, Node, NodeProps, Position} from "@xyflow/react";
import {useShallow} from "zustand/react/shallow";
import NodeaaContainer from "@/ui/nodes-ui/NodeaaContainer.tsx";
import NodeaaHeader from "@/ui/nodes-ui/NodeaaHeader.tsx";
import {ctxRecorder} from "@/engine/audio.ts";

type OutNodeType = Node<Record<string, never>, 'outNode'>;

const OutNode: FC<NodeProps<OutNodeType>> = ({selected}) => {
    const isRunning = useNodeStore(useShallow((state) => state.isRunning));
    const toggleAudio = useNodeStore(useShallow((state) => state.toggleAudio));

    const isRecording = useNodeStore(useShallow((state) => state.isRecording))
    const setIsRecording = useNodeStore(useShallow((state) => state.setIsRecording))

    const toggleRecording = () => {
        setIsRecording(!isRecording)
    }

    useEffect(() => {
        if (isRecording) {
            ctxRecorder.start()
        } else {
            ctxRecorder.stop()
        }
    }, [isRecording]);

    return (
        <NodeaaContainer selected={selected} width={7} height={8}>
            <Handle type="target" position={Position.Top} id="audio"/>
            <NodeaaHeader nodeName='Audio Out' headerColor='bg-blue-500' />
            <div
                className='flex flex-col nodrag cursor-default bg-white p-2 h-[6rem] justify-center items-center rounded-b-xl gap-y-2'>
                <label>
                    <button
                        onClick={toggleAudio}
                        className={`font-bold text-center p-1 text-sm ${isRunning ? 'bg-green-500' : 'bg-red-500'}`}>
                        {isRunning ? (
                            <span className='text-white'>Audio On</span>
                        ) : (
                            <span className='text-black'>Audio Off</span>
                        )}
                    </button>
                </label>

                <label>
                    <button
                        onClick={toggleRecording}
                        className={`font-bold text-center p-1 text-sm ${isRecording ? 'bg-red-500' : 'bg-gray-500'}`}>
                        {isRecording ? (
                            <span className='text-white'>Recording</span>
                        ) : (
                            <span className='text-black'>Recording</span>
                        )}
                    </button>
                </label>
            </div>
        </NodeaaContainer>
    )
}
export default memo(OutNode)
