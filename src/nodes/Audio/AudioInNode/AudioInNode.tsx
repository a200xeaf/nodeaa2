import {FC, memo, useState} from "react";
import {Handle, NodeProps, Position} from "@xyflow/react";
import NodeaaContainer from "@/ui/nodes-ui/NodeaaContainer";
import NodeaaHeader from "@/ui/nodes-ui/NodeaaHeader.tsx";
import {createAudioInputNode} from "@/engine/audio.ts";

const AudioInNode: FC<NodeProps> = ({id, selected}) => {
    const [input, setInput] = useState<MediaStream | null>(null)

    const getAudioInputs = async() => {
        try {
            const mic = await navigator.mediaDevices.getUserMedia(
                { audio: {
                    noiseSuppression: false,  // Turn off noise suppression
                    echoCancellation: false, // Turn off echo cancellation
                    autoGainControl: false
                }})
            setInput(mic)
            createAudioInputNode(id, mic)
        } catch (e) {
            console.log("User declined access or can't access", e)
        }
    }

    return (
        <NodeaaContainer selected={selected} width={23} height={12}>
            <NodeaaHeader nodeName="Audio Input" headerColor='bg-purple-500'/>
            <div className='flex flex-col nodrag cursor-default bg-white p-2 h-[10rem] rounded-b-xl'>
                <button onClick={getAudioInputs}>test</button>
                {input &&
                    <div>{input.id}</div>
                }
            </div>
            <Handle type="source" position={Position.Bottom} id='audio'/>
        </NodeaaContainer>
    )
}
export default memo(AudioInNode)
