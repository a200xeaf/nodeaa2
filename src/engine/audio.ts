import {Node as FlowNode} from "@xyflow/react";
import {createDevice, Device} from "@rnbo/js";
import gainPatcher from '../nodes/GainNode/gain.export.json'
import osc2Patcher from '../nodes/Osc2Node/osc2.export.json'

export const context = new AudioContext();
const nodes = new Map();

nodes.set('output', context.destination);

export const createAudioNode = async (id: string, type: string, data: Partial<FlowNode['data']>) => {
    switch (type) {
        case 'osc': {
            const node = context.createOscillator()
            //FIXME Typechecking proper
            node.frequency.value = data.frequency as number
            node.type = data.type as OscillatorType
            node.start()

            nodes.set(id, node)
            break
        }

        case 'gainNode': {
            // @ts-expect-error rainbow issue
            const node = await createDevice({context, patcher: gainPatcher})
            const gain = node.parametersById.get('gain_gain')
            gain.value = data.gain_gain

            nodes.set(id, node)
            break
        }

        case 'osc2Node': {
            // @ts-expect-error rainbow issue
            const node = await createDevice({context, patcher: osc2Patcher})
            const frequency = node.parametersById.get('osc_frequency')
            const type = node.parametersById.get('osc_type')
            frequency.value = data.osc_frequency
            type.value = data.osc_type

            nodes.set(id, node)
            break
        }
    }
}

export const updateAudioNode = (id: string, data: Partial<FlowNode['data']>) => {
    const node = nodes.get(id);

    if (!node) {
        throw new Error(`Node with ID ${id} not found`);
    }

    try {
        // Loop through each key-value pair in the data object and update the corresponding parameter
        for (const [key, val] of Object.entries(data)) {
            console.log(`Updating parameter ${key} to ${val}`);

            // Find the parameter that matches the key in the node
            //FIXME
            // @ts-expect-error any type
            const param = node.parameters.find(p => p.name === key);
            if (param) {
                if (typeof val === 'number') {
                    param.value = val;  // Update parameter value
                    console.log(`Updated ${key} to ${val}`);
                } else {
                    console.error(`Invalid value for ${key}: Must be a number`);
                }
            } else {
                console.error(`Parameter ${key} not found on device`);
            }
        }
    } catch (error) {
        console.error("Error updating audio node:", error);
    }
};

export const deleteAudioNode = (id: string) => {
    const node: Device = nodes.get(id);

    node.node.disconnect()

    nodes.delete(id)
}

export const connectNodes = (sourceID: string, targetID: string) => {
    const source = nodes.get(sourceID);
    const target = targetID === 'output' ? context.destination : nodes.get(targetID);

    if (!source || !target) {
        throw new Error(`Invalid node IDs: ${sourceID} or ${targetID} not found`);
    }

    try {
        if (targetID === 'output') {
            source.node.connect(target);
        } else {
            source.node.connect(target.node);
        }
        console.log(`Connected left and right channels from ${sourceID} to ${targetID}`);
    } catch (error) {
        console.error("Failed to connect nodes:", error);
    }
};

export const disconnectNodes = (sourceID: string, targetID: string) => {
    const source = nodes.get(sourceID);
    const target = targetID === 'output' ? context.destination : nodes.get(targetID); // Special handling for output

    if (!source || !target) {
        throw new Error(`Invalid node IDs: ${sourceID} or ${targetID} not found`);
    }

    try {
        // Disconnect left and right channels, if target is 'output', it's context.destination
        source.node.disconnect(target); // Disconnect Source left -> Target left

        console.log(`Disconnected left and right channels from ${sourceID} to ${targetID}`);
    } catch (error) {
        console.error("Failed to disconnect nodes:", error);
    }
};

export const isRunningEngine = () => {
    return context.state === 'running'
}

export const toggleAudioEngine = () => {
    return isRunningEngine() ? context.suspend() : context.resume()
}