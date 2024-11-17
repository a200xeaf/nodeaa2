import {Handle, Node, NodeProps, Position, useHandleConnections} from "@xyflow/react";
import {FC, memo, useCallback} from "react";
import {useNodeStore} from "@/engine/store.ts";
import {useShallow} from "zustand/react/shallow";
import {sendMidi} from "@/engine/audio.ts";
import {useEmitterSubscriptions} from "@/engine/utils/hooks/useEmitterSubscription.ts";
import NodeaaContainer from "@/ui/nodes-ui/NodeaaContainer.tsx";
import NodeaaHeader from "@/ui/nodes-ui/NodeaaHeader.tsx";
import Knob from "@/ui/inputs/Knob.tsx";
import {amountFormat} from "@/engine/utils/number-formats.ts";

type FaustKarplusNodeData = {
    faustKarplus_damping: number
};

type FaustKarplusNodeType = Node<FaustKarplusNodeData, 'faustKarplusNode'>;

const FaustKarplusNode: FC<NodeProps<FaustKarplusNodeType>> = ({id, data, selected}) => {
    const updateNode = useNodeStore(useShallow((state) => state.updateNode));
    const midiConnections = useHandleConnections({type: 'target', id: 'midi'})

    const handleMIDI = useCallback((e: Uint8Array) => {
        sendMidi(id, e);
    }, [id]);

    const setParams = useCallback((name: string, value: number) => {
        updateNode(id, { [`faustKarplus_${name}`]: value})
    }, [id, updateNode])

    useEmitterSubscriptions({
        connections: midiConnections,
        callback: handleMIDI,
        data
    })

    return (
        <NodeaaContainer selected={selected} width={8} height={9}>
            <Handle type="target" position={Position.Top} id='midi' style={{backgroundColor: 'rgb(59, 130, 246)'}}/>
            <NodeaaHeader nodeName='Karplus Synth' headerColor='bg-amber-500'/>
            <div className='flex flex-col justify-center nodrag cursor-default bg-white p-2 h-[7rem] rounded-b-xl'>
                <div className='flex flex-col items-center' data-info-panel-id="faustDelayNode-wet">
                    <span>Note Length</span>
                    <Knob value={data.faustKarplus_damping} default_value={0.1} id='damping' max_value={1}
                          min_value={0.01} callback={setParams}/>
                    <span>{amountFormat(data.faustKarplus_damping * 100)}</span>
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} id='audio'/>
        </NodeaaContainer>
    )
}
export default memo(FaustKarplusNode)
