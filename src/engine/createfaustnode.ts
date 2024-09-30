import {
    FaustMonoDspGenerator,
    FaustDspMeta,
    FaustMonoAudioWorkletNode,
    FaustPolyAudioWorkletNode
} from "@grame/faustwasm";

type FaustNode =
    | FaustMonoAudioWorkletNode
    | FaustPolyAudioWorkletNode

interface FaustDspDistribution {
    dspModule: WebAssembly.Module;            // Required
    dspMeta: FaustDspMeta;                    // Required
    effectModule?: WebAssembly.Module;        // Optional
    effectMeta?: FaustDspMeta;                // Optional
    mixerModule?: WebAssembly.Module;         // Optional
}

export const createFaustNode = async (
    path: string,
    context: AudioContext,
    voices: number
) : Promise<{ faustNode: FaustNode; dspMeta: FaustDspMeta } | never> => {
    const dspMetaResponse = await fetch(`/nodes/${path}/dsp-meta.json`);
    const dspMeta: FaustDspMeta = await dspMetaResponse.json(); // Parse the JSON response

    // Fetch and compile the dsp-module.wasm from the public folder
    const dspModuleResponse = await fetch(`/nodes/${path}/dsp-module.wasm`);
    const dspModule = await WebAssembly.compileStreaming(dspModuleResponse);

    const faustDSP: FaustDspDistribution = {dspMeta, dspModule};

    let faustNode: FaustNode | null = null;

    if (voices > 0) {
        throw new Error('Failed to create faustNode.');
    } else {
        const generator = new FaustMonoDspGenerator()
        faustNode = await generator.createNode(
            context,
            path,
            { module: faustDSP.dspModule, json: JSON.stringify(faustDSP.dspMeta), soundfiles: {}},
            false
        )
    }

    if (faustNode === null) {
        throw new Error('Failed to create faustNode.');
    }

    return {faustNode, dspMeta}
}