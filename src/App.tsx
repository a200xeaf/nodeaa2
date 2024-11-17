import {Background, BackgroundVariant, ReactFlow, Connection, Edge, useViewport} from '@xyflow/react';
import { useNodeStore } from './engine/store';
import OutNode from '@/nodes/Misc/OutNode/OutNode.tsx';
import FaustGainNode from "@/nodes/Audio/FaustGainNode/FaustGainNode.tsx";
import FaustPolyNode from "@/nodes/Audio/FaustPolyNode/FaustPolyNode.tsx";
import Osc2Node from "@/nodes/Audio/Osc2Node/Osc2Node.tsx";
import MidiInNode from "@/nodes/Midi/MidiInNode/MidiInNode.tsx";
import NumberNode from "@/nodes/Data/NumberNode/NumberNode.tsx";
import ViewerNode from "@/nodes/Data/ViewerNode/ViewerNode.tsx";
import {useShallow} from "zustand/react/shallow";
import AudioEdge from "./ui/edges/AudioEdge.tsx";
import MidiEdge from "./ui/edges/MidiEdge.tsx";
import NodeToolbarMenu from "@/ui/NodeToolbarMenu.tsx";
import CreatorNode from "@/nodes/Misc/CreatorNode/CreatorNode.tsx";
import {useEffect, useRef, useState} from "react";
import FaustLPFNode from "@/nodes/Audio/FaustLPFNode/FaustLPFNode.tsx";
import NodeaaWelcome from "@/ui/NodeaaWelcome.tsx";
import FaustDelayNode from "@/nodes/Audio/FaustDelayNode/FaustDelayNode.tsx";
import MidiKeyboardNode from "@/nodes/Midi/MidiKeyboardNode/MidiKeyboardNode.tsx";
import {mainemitter} from "@/engine/utils/eventbus.ts";
import {infoMap, InfoObject} from "@/engine/data/info-map.ts";
import NodeaaInfoPanel from "@/ui/NodeaaInfoPanel.tsx";
import {CSSTransition} from "react-transition-group";
import './animations.css'
import {NODEAACONFIG} from "@/engine/data/constants.ts";
import NodeaaLoading from "@/ui/NodeaaLoading.tsx";
import FaustKarplusNode from "@/nodes/Audio/FaustKarplusNode/FaustKarplusNode.tsx";

const nodeTypes = {
    osc2Node: Osc2Node,
    faustGainNode: FaustGainNode,
    faustPolyNode: FaustPolyNode,
    faustLPFNode: FaustLPFNode,
    faustDelayNode: FaustDelayNode,
    faustKarplusNode: FaustKarplusNode,
    outNode: OutNode,
    midiInNode: MidiInNode,
    midiKeyboardNode: MidiKeyboardNode,
    numberNode: NumberNode,
    viewerNode: ViewerNode,
    creatorNode: CreatorNode
};

const edgeTypes = {
    solidBlueEdge: MidiEdge,
    animatedGreenDashedEdge: AudioEdge,
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

    const createNode = useNodeStore(useShallow((state) => state.createNode));

    const onNodesChange = useNodeStore(useShallow((state) => state.onNodesChange));
    const onEdgesChange = useNodeStore(useShallow((state) => state.onEdgesChange));
    const onNodesDelete = useNodeStore(useShallow((state) => state.onNodesDelete));
    const onEdgesDelete = useNodeStore(useShallow((state) => state.onEdgesDelete));

    const onConnect = useNodeStore(useShallow((state) => state.onConnect));

    const graphBackground = useNodeStore(useShallow((state) => state.graphBackground));

    const setViewport = useNodeStore(useShallow((state) => state.setViewport));
    const {x, y, zoom} = useViewport();
    useEffect(() => {
        // Update the Zustand store with the new viewport object
        setViewport(x, y, zoom);
    }, [x, y, zoom, setViewport]);

    const [mousePos, setMousePos] = useState({x: 0, y: 0});
    const [draggingKnobId, setDraggingKnobId] = useState<string | null>(null);
    const [initialMouseX, setInitialMouseX] = useState<number>(0);
    const [initialMouseY, setInitialMouseY] = useState<number>(0);

    const infoPanelRef = useRef<HTMLDivElement>(null)
    const [infoPanelID, setInfoPanelID] = useState<InfoObject | null>(null);
    const [showInfoPanel, setShowInfoPanel] = useState<boolean>(true);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if the target is an input field, textarea, or content-editable element
            if (!(useNodeStore.getState().currentlyArmed.size === 0)) {
                mainemitter.emit("keydownarmed", e)
                return
            }

            const isInputFocused = document.activeElement &&
                (document.activeElement.tagName === 'INPUT' ||
                    document.activeElement.tagName === 'TEXTAREA');

            if (e.key.toLowerCase() === 'n' && !isInputFocused) {
                const pos = {
                    x: (mousePos.x - 40 - x) / zoom,
                    y: (mousePos.y - 20 - y) / zoom
                };
                createNode('creatorNode', pos);
            }

            if (e.key.toLowerCase() === 'i' && !isInputFocused) {
                setShowInfoPanel((prev) => !prev);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (useNodeStore.getState().currentlyArmed.size === 0) {
                return
            } else {
                mainemitter.emit("keyuparmed", e)
            }
        }

        const handleMouseDown = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target && target.id && target.id.startsWith('controller-')) {
                const canvasID = target.id;

                // Start dragging
                setDraggingKnobId(canvasID);
                setInitialMouseX(e.clientX);
                setInitialMouseY(e.clientY);

                // Emit 'mousedown' event to the knob
                mainemitter.emit(canvasID, {
                    type: 'mousedown',
                });
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });

            if (e.target !== null && draggingKnobId === null) {
                const target = e.target as HTMLElement;

                const closestInfoPanel = target.closest("[data-info-panel-id]");
                const infoPanelID = closestInfoPanel?.getAttribute("data-info-panel-id");

                if (infoPanelID) {
                    const infoText = infoMap.get(infoPanelID);
                    setInfoPanelID(infoText || null);
                } else {
                    setInfoPanelID(null);
                }
            }

            if (draggingKnobId) {
                const deltaX = e.clientX - initialMouseX;
                const deltaY = e.clientY - initialMouseY;

                // Update initial positions for the next move
                setInitialMouseX(e.clientX);
                setInitialMouseY(e.clientY);

                // Emit 'mousemove' event to the knob
                mainemitter.emit(draggingKnobId, {
                    type: 'mousemove',
                    deltaX: deltaX,
                    deltaY: deltaY,
                    shiftKey: e.shiftKey,
                });
            }
        };

        const handleMouseUp = () => {
            if (draggingKnobId) {
                // Emit 'mouseup' event to the knob
                mainemitter.emit(draggingKnobId, {
                    type: 'mouseup',
                });
                setDraggingKnobId(null);
            }
        };

        const handleDoubleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target && target.id && target.id.startsWith('controller-')) {
                const canvasID = target.id;

                // Emit 'doubleclick' event to the knob
                mainemitter.emit(canvasID, {
                    type: 'doubleclick',
                });
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('dblclick', handleDoubleClick);

        // Don't forget to clean up
        return function cleanup() {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('dblclick', handleDoubleClick);
        }
    }, [mousePos, x, y, zoom, createNode, draggingKnobId, initialMouseY, initialMouseX]);

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
                <NodeToolbarMenu/>

                {graphBackground === 'none' ? null : <Background variant={getBackgroundVariant(graphBackground)} gap={28}/>}
            </ReactFlow>
            {/*<div className='absolute z-[9999] h-screen w-screen top-0 left-0'>*/}
            {/*    <NodeContextMenu />*/}
            {/*</div>*/}
            <p className='z-[9998] absolute top-0 right-0 bg-white p-2 rounded-md m-2 font-medium text-sm
                border h-10'
            >
                {x.toFixed(2)}, {y.toFixed(2)}, {zoom.toFixed(2)}
            </p>
            <p className='absolute bottom-[1.5px] right-[57px] text-[10px] text-gray-400 p-[1px]'>
                {`Nodeaa v${NODEAACONFIG.VERSION} +`}
            </p>
            <NodeaaWelcome />
            <NodeaaLoading />
            <CSSTransition
                in={showInfoPanel}
                timeout={100}  // Duration of the transition
                classNames="fade" // Base name for transition classes
                nodeRef={infoPanelRef} // Pass the ref to manage DOM nodes
                unmountOnExit
            >
                <div ref={infoPanelRef}>
                    <NodeaaInfoPanel idInfo={infoPanelID} />
                </div>
            </CSSTransition>
        </div>
    );
};

export default App;