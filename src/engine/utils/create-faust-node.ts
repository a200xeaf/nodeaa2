import {
    FaustMonoDspGenerator,
    FaustDspMeta,
    FaustMonoAudioWorkletNode,
    FaustPolyAudioWorkletNode,
    FaustPolyDspGenerator,
} from "@grame/faustwasm";
import { FaustCustomNodeConfig } from "@/engine/types/node-types.ts";

type FaustNode = FaustMonoAudioWorkletNode | FaustPolyAudioWorkletNode;

interface FaustDspDistribution {
    dspModule: WebAssembly.Module; // Required
    dspMeta: FaustDspMeta; // Required
    effectModule?: WebAssembly.Module; // Optional
    effectMeta?: FaustDspMeta; // Optional
    mixerModule?: WebAssembly.Module; // Optional
}

export const createFaustNode = async (
    path: string,
    context: AudioContext,
    voices: number,
): Promise<{ faustNode: FaustNode; dspMeta: FaustDspMeta } | never> => {
    const dspMetaResponse = await fetch(`/nodes/${path}/dsp-meta.json`);
    const dspMeta: FaustDspMeta = await dspMetaResponse.json(); // Parse the JSON response

    // Fetch and compile the dsp-module.wasm from the public folder
    const dspModuleResponse = await fetch(`/nodes/${path}/dsp-module.wasm`);
    const dspModule = await WebAssembly.compileStreaming(dspModuleResponse);

    const faustDSP: FaustDspDistribution = { dspMeta, dspModule };

    let faustNode: FaustNode | null = null;

    if (voices > 0) {
        faustDSP.mixerModule = await WebAssembly.compileStreaming(await fetch(`/nodes/${path}/mixer-module.wasm`));
        const generator = new FaustPolyDspGenerator();
        faustNode = await generator.createNode(
            context,
            voices,
            path,
            {
                module: faustDSP.dspModule,
                json: JSON.stringify(faustDSP.dspMeta),
                soundfiles: {},
            },
            faustDSP.mixerModule,
            undefined,
            false,
        );
    } else {
        const generator = new FaustMonoDspGenerator();
        faustNode = await generator.createNode(
            context,
            path,
            {
                module: faustDSP.dspModule,
                json: JSON.stringify(faustDSP.dspMeta),
                soundfiles: {},
            },
            false,
        );
    }

    if (faustNode === null) {
        throw new Error("Failed to create faustNode.");
    }

    return { faustNode, dspMeta };
};

export const createCustomFaustNode = async (device: FaustCustomNodeConfig, context: AudioContext) => {
    const dspMeta: FaustDspMeta = device.metadata as unknown as FaustDspMeta;

    const binaryString = atob(device.wasm);

    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    const dspModule = await WebAssembly.compile(bytes);

    const faustDSP: FaustDspDistribution = { dspMeta, dspModule };
    let faustNode: FaustNode | null = null;

    const generator = new FaustMonoDspGenerator();

    faustNode = await generator.createNode(
        context,
        dspMeta.name,
        {
            module: faustDSP.dspModule,
            json: JSON.stringify(faustDSP.dspMeta),
            soundfiles: {},
        },
        false,
    );

    return { faustNode, dspMeta };
};
