import { ChangeEvent, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import {
    FaustCompiler,
    FaustDspFactory,
    FaustMonoAudioWorkletNode,
    FaustMonoDspGenerator,
    FaustUIItem,
    instantiateFaustModuleFromFile,
    LibFaust,
} from "@grame/faustwasm";
import EditorPreview from "@/components/editor/editorui/EditorPreview.tsx";

const editorAudioEngine = new AudioContext({ latencyHint: "balanced" });
const connectionMap = new Map<AudioNode, Set<AudioNode>>();

function connectNodes(source: AudioNode, destination: AudioNode) {
    let destinations = connectionMap.get(source);
    if (!destinations) {
        destinations = new Set();
        connectionMap.set(source, destinations);
    }
    if (!destinations.has(destination)) {
        destinations.add(destination);
        source.connect(destination);
    }
}

function disconnectNodes(source: AudioNode, destination: AudioNode) {
    const destinations = connectionMap.get(source);
    if (destinations && destinations.has(destination)) {
        destinations.delete(destination);
        source.disconnect(destination);
    }
}

const constantSoucreNode = editorAudioEngine.createConstantSource();
constantSoucreNode.offset.value = 0.0;
constantSoucreNode.start(0);

interface FaustParameters {
    ui: FaustUIItem[] | null;
}

const EditorApp = () => {
    const [engineState, setEngineState] = useState<boolean>(false);
    const [faustCompilerState, setFaustCompilerState] = useState<string | null>(null);
    const [faustCode, setFaustCode] = useState<string>("");
    const [faustCompiledState, setFaustCompiledState] = useState<{ state: string; message: string }>({
        state: "idle",
        message: "",
    });
    const [parameters, setParameters] = useState<FaustParameters | null>(null);

    const audioInputRef = useRef<HTMLAudioElement | null>(null);
    const audioInputNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
    const faustCompiler = useRef<FaustCompiler | null>(null);
    const faustEffect = useRef<FaustMonoDspGenerator | null>(null);
    const faustCompiledNode = useRef<FaustMonoAudioWorkletNode | null>(null);

    const updateAudioNodeParameter = (address: string, value: unknown) => {
        if (typeof value !== "number") {
            console.error("Expected a number value for the parameter.");
            return;
        }
        if (!parameters) {
            console.error("Parameters not laoded? Maybe desync?");
            return;
        }
        if (!faustCompiledNode.current) {
            console.error("Faust node not found!");
            return;
        }
        const audioParam = faustCompiledNode.current.parameters.get(address);
        if (!audioParam) {
            console.error("Faust audioparam not found!");
        } else {
            console.log("Audioparam found!", audioParam);
            audioParam.setValueAtTime(value, 0);
        }
    };

    useEffect(() => {
        const handleEngineStateChange = async () => {
            setEngineState(editorAudioEngine.state === "running");
        };
        editorAudioEngine.addEventListener("statechange", handleEngineStateChange);
    }, []);

    useEffect(() => {
        const prepareFaustLib = async () => {
            const faustModulePath = new URL("@grame/faustwasm/libfaust-wasm/libfaust-wasm.js", import.meta.url).href;
            const faustModule = await instantiateFaustModuleFromFile(faustModulePath);
            const libFaust = new LibFaust(faustModule);
            faustCompiler.current = new FaustCompiler(libFaust);
            faustEffect.current = new FaustMonoDspGenerator();
            console.log(faustCompiler.current);
            setFaustCompilerState(libFaust.version());
        };

        prepareFaustLib();
    }, []);

    const toggleEngineState = async (forceOn = false) => {
        if (forceOn) {
            await editorAudioEngine.resume();
            return;
        }
        if (engineState) {
            await editorAudioEngine.suspend();
        } else {
            await editorAudioEngine.resume();
        }
    };

    const handleAudioInputFile = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0 && audioInputRef.current) {
            const file = e.target.files[0];
            audioInputRef.current.src = URL.createObjectURL(file);
            // Create a media element source from the audio element.
            audioInputNodeRef.current = editorAudioEngine.createMediaElementSource(audioInputRef.current);
            // If a compiled node exists, route the audio through it...
            if (faustCompiledNode.current) {
                // In case there was a direct connection, remove it first.
                disconnectNodes(audioInputNodeRef.current, editorAudioEngine.destination);
                connectNodes(audioInputNodeRef.current, faustCompiledNode.current);
            } else {
                // Otherwise, route audio directly to the destination.
                connectNodes(audioInputNodeRef.current, editorAudioEngine.destination);
            }
        }
    };

    const compileFaust = async () => {
        await toggleEngineState(true);
        if (faustEffect.current && faustCompiler.current) {
            const argv = ["-I", "libraries/"];
            let compiledFactory: FaustDspFactory | null = null;
            try {
                compiledFactory = await faustCompiler.current.createMonoDSPFactory("test", faustCode, argv.join(" "));
            } catch (error) {
                //@ts-expect-error fuck that
                setFaustCompiledState({ state: "error", message: error.message });
            }
            if (compiledFactory) {
                const compiledNode = await faustEffect.current.createNode(
                    editorAudioEngine,
                    "test",
                    compiledFactory,
                    false,
                );
                setFaustCompiledState({ state: "success", message: "" });
                if (compiledNode) {
                    console.log(compiledNode.getMeta());
                    setParameters(compiledNode.getMeta());
                    // If a compiled node already exists, remove its connection from the destination.
                    if (faustCompiledNode.current) {
                        disconnectNodes(constantSoucreNode, faustCompiledNode.current);
                        disconnectNodes(faustCompiledNode.current, editorAudioEngine.destination);
                    }
                    // Set the new compiled node and connect it to the destination.
                    faustCompiledNode.current = compiledNode;
                    connectNodes(constantSoucreNode, compiledNode);
                    connectNodes(compiledNode, editorAudioEngine.destination);

                    // Now, if an audio file is already loaded, reroute its connection.
                    if (audioInputNodeRef.current) {
                        // Remove any direct connection from the audio source to the destination.
                        disconnectNodes(audioInputNodeRef.current, editorAudioEngine.destination);
                        // Connect the audio source to the compiled node.
                        connectNodes(audioInputNodeRef.current, compiledNode);
                    }
                }
            }
        }
    };

    return (
        <div className="flex flex-col gap-y-4 w-full h-full text-center p-4">
            <div className="flex bg-gray-200 rounded p-4 gap-x-4 items-center">
                <button
                    className="bg-gray-500 hover:bg-gray-700 rounded text-white p-2"
                    onClick={() => toggleEngineState}
                >
                    Toggle Engine
                </button>
                <button
                    className="bg-gray-500 hover:bg-gray-700 rounded text-white p-2"
                    onClick={() => console.log(editorAudioEngine.state === "running")}
                >
                    Check Engine
                </button>
                <p className={`${engineState ? "text-green-500" : "text-red-500"}`}>
                    Audio Engine state: {engineState ? "Running" : "Not running"}
                </p>
                <p className={`${faustCompilerState ? "text-green-500" : "text-red-500"}`}>
                    Faust state: {faustCompilerState ? `Loaded (${faustCompilerState})` : "Not Loaded"}
                </p>
            </div>
            <div className="flex h-full items-center gap-x-4">
                <div className="flex flex-col gap-y-4 border-gray-200 border-4 p-4">
                    <audio controls={true} ref={audioInputRef} />
                    <input type="file" accept="audio/*" onChange={handleAudioInputFile} />
                </div>
                <ArrowRight color={"#e5e7eb"} size={96} />
                <div className="flex flex-col gap-y-4 border-gray-200 border-4 w-[40%] h-full p-4">
                    <textarea
                        className="w-full h-full resize-none"
                        onChange={(e) => setFaustCode(e.target.value)}
                        value={faustCode}
                    />
                    <button className="bg-gray-500 rounded text-white p-2 hover:bg-gray-700" onClick={compileFaust}>
                        Compile Code
                    </button>
                    {faustCompiledState.state === "error" ? (
                        <div className="flex flex-col bg-red-500 text-white p-4">
                            <p>Status: {faustCompiledState.state}</p>
                            <p>Message: {faustCompiledState.message}</p>
                        </div>
                    ) : (
                        <p
                            className={`${faustCompiledState.state === "idle" ? "bg-gray-500" : "bg-green-500"} p-4 text-white`}
                        >
                            Status: {faustCompiledState.state}
                        </p>
                    )}
                </div>
                <ArrowRight color={"#e5e7eb"} size={96} />
                <EditorPreview parameters={parameters} updateParameter={updateAudioNodeParameter} />
            </div>
        </div>
    );
};

export default EditorApp;
