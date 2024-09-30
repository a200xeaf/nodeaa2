import {Node as FlowNode} from "@xyflow/react";
import {createDevice, Device, IPatcher, MIDIEvent, Parameter, WorkletDevice} from "@rnbo/js";
import {FaustMonoAudioWorkletNode, FaustPolyAudioWorkletNode} from "@grame/faustwasm";
import {createFaustNode} from "./createfaustnode.ts";

export const context = new AudioContext({latencyHint: 1});
console.log(context.baseLatency.toString())
const nodes = new Map<string, Device | FaustMonoAudioWorkletNode | FaustPolyAudioWorkletNode | AudioNode>()

nodes.set('output-1', context.destination);

export const createAudioNode = async (id: string, type: "faust" | "rnbo", name: string, data: Partial<FlowNode['data']>) => {
    console.log(nodes.size)
    switch (type) {
        case 'faust': {
            try {
                const node = await createFaustNode(name, context, 0);

                // Iterate over the parameters in the node and set values from the `data` object
                Object.entries(data).forEach(([key, value]) => {
                    // Split the key to extract the device name and the actual parameter name
                    const [deviceName, paramName] = key.split('_');

                    // Ensure the extracted device name matches the current device name
                    if (deviceName !== name) {
                        console.warn(`Device name "${deviceName}" does not match the node name "${name}". Skipping.`);
                        return;
                    }

                    // Try to get the parameter from the node's AudioParams using the correct format
                    const param = node.faustNode.parameters.get(`/${deviceName}/${paramName}`);

                    if (param === undefined) {
                        console.warn(`"${paramName}" parameter in device "${deviceName}" not found.`);
                    } else if (typeof value === 'number') {
                        // Set the value if it's a number
                        param.setValueAtTime(value, 0);
                        console.log(`Set parameter ${paramName} to ${value}`);
                    } else {
                        console.warn(`Value for parameter "${paramName}" must be a number. Received: ${value}`);
                    }
                });

                // Add the Faust node to the nodes map
                nodes.set(id, node.faustNode);
            } catch (e) {
                console.error(e);
            }
            break;
        }

        case 'rnbo': {
            const rawPatcher = await fetch(`/nodes/${name}/${name}.export.json`);
            const patcher = await rawPatcher.json() as IPatcher;
            const node = await createDevice({ context, patcher: patcher });

            // Iterate over the parameters in the RNBO node and set values from the `data` object
            Object.entries(data).forEach(([key, value]) => {
                const parameter: Parameter = node.parametersById.get(key);

                if (parameter) {
                    if (typeof value === 'number') {
                        parameter.value = value;
                        console.log(`Set ${key} to ${value}`);
                    } else {
                        console.warn(`Value for parameter "${key}" must be a number. Received: ${value}`);
                    }
                } else {
                    console.warn(`Warning: Parameter ${key} not found in the device.`);
                }
            });

            nodes.set(id, node);
            break;
        }
    }
}

export const updateAudioNode = (id: string, data: Partial<FlowNode['data']>) => {
    const node = nodes.get(id);

    if (!node) {
        throw new Error(`Node with ID ${id} not found`);
    }

    try {
        // Determine the type of node (RNBO, Faust, or other) before entering the loop
        if (isRNBO(node)) {
            // RNBO node: handle RNBO-specific parameter updates
            for (const [key, val] of Object.entries(data)) {
                console.log(`Updating RNBO parameter ${key} to ${val}`);
                const param = node.parametersById.get(key);

                if (param) {
                    if (typeof val === 'number') {
                        param.value = val;
                        console.log(`Updated ${key} to ${val} on RNBO device`);
                    } else {
                        console.error(`Invalid value for ${key}: Must be a number`);
                    }
                } else {
                    console.error(`Parameter ${key} not found on RNBO device`);
                }
            }
        } else if (isFaust(node)) {
            // Faust node: handle Faust-specific parameter updates
            for (const [key, val] of Object.entries(data)) {
                // Split the key to extract device name and parameter name
                const [deviceName, paramName] = key.split('_');

                // Try to get the parameter from the node's AudioParams using the correct format
                const param = node.parameters.get(`/${deviceName}/${paramName}`);

                if (param) {
                    if (typeof val === 'number') {
                        param.setValueAtTime(val, 0);
                        console.log(`Updated ${paramName} to ${val} on Faust node`);
                    } else {
                        console.error(`Invalid value for ${paramName}: Must be a number`);
                    }
                } else {
                    console.error(`Parameter ${paramName} not found on Faust node`);
                }
            }
        } else if (node instanceof AudioNode) {
            // Generic AudioNode: handle cases where node is an AudioNode
            console.warn(`Generic AudioNode provided, no parameters to update for ${id}`);
        } else {
            console.error(`Unknown node type for ID ${id}`);
        }
    } catch (error) {
        console.error("Error updating audio node:", error);
    }
};

export const deleteAudioNode = (id: string) => {
    const node = nodes.get(id);

    if (isRNBO(node)) {
        node.node.disconnect()
        nodes.delete(id)
    } else if (isFaust(node)) {
        node.disconnect()
        nodes.delete(id)
    } else {
        console.warn("unknown device attempted to be deleted")
    }
}

const getAudioNode = (id: string): AudioNode | undefined => {
    if (id.startsWith('output-')) {
        return context.destination; // Special handling for 'output'
    }

    const device = nodes.get(id);
    if (!device) return undefined;

    // Check if it's an RNBO device and its node is an AudioNode
    if (isRNBO(device)) {
        const rnboNode = device.node;
        return rnboNode instanceof AudioNode ? rnboNode : undefined;
    }

    // If not an RNBO device, check if the device itself is an AudioNode
    return device instanceof AudioNode ? device : undefined;
};

const connectOrDisconnectNodes = (action: 'connect' | 'disconnect', sourceID: string, targetID: string) => {
    const sourceNode = getAudioNode(sourceID);
    const targetNode = getAudioNode(targetID);

    if (!sourceNode || !targetNode) {
        throw new Error(`Invalid node IDs: ${sourceID} or ${targetID} not found`);
    }

    try {
        // Now we can perform either connect or disconnect depending on the action
        if (action === 'connect') {
            sourceNode.connect(targetNode);
            console.log(`Connected ${sourceID} to ${targetID}`);
        } else if (action === 'disconnect') {
            sourceNode.disconnect(targetNode);
            console.log(`Disconnected ${sourceID} from ${targetID}`);
        }
    } catch (error) {
        console.error(`Failed to ${action} nodes:`, error);
    }
};

export const connectNodes = (sourceID: string, targetID: string) => {
    connectOrDisconnectNodes('connect', sourceID, targetID);
};

export const disconnectNodes = (sourceID: string, targetID: string) => {
    connectOrDisconnectNodes('disconnect', sourceID, targetID);
};

export const isRunningEngine = () => {
    return context.state === 'running'
}

export const toggleAudioEngine = () => {
    return isRunningEngine() ? context.suspend() : context.resume()
}

// export const sendMidi = (id: string, e: MIDIEvent)=> {
//     const deviceToSend: Device = nodes.get(id)
//     deviceToSend.scheduleEvent(e)
// }

const isRNBO = (device: unknown): device is WorkletDevice => {
    return device instanceof WorkletDevice;
}

const isFaust = (device: unknown): device is FaustMonoAudioWorkletNode | FaustPolyAudioWorkletNode => {
    return device instanceof FaustMonoAudioWorkletNode || device instanceof FaustPolyAudioWorkletNode
}