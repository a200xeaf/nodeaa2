import {Node as FlowNode} from "@xyflow/react";

const context = new AudioContext();
const nodes = new Map();

nodes.set('output', context.destination);

export const createAudioNode = (id: string, type: string, data: Partial<FlowNode['data']>) => {
    switch (type) {
        case 'osc': {
            const node = context.createOscillator()
            node.frequency.value = data.frequency
            node.type = data.type
            node.start()

            nodes.set(id, node)
            break
        }
    }
}

export const updateAudioNode = (id: string, data: Partial<FlowNode['data']>) => {
    console.log(data)
    const node = nodes.get(id);
    for (const [key, val] of Object.entries(data)) {
        if (node[key] instanceof AudioParam) {
            if (typeof val === 'number') {
                node[key].value = val;
            }
        } else {
            node[key] = val;
        }
    }
}

export const deleteAudioNode = (id: string) => {
    const node = nodes.get(id);

    node.disconnect()
    node.stop?.()

    nodes.delete(id)
}

export const connectNodes = (sourceID: string, targetID: string) => {
    const source = nodes.get(sourceID);
    const target = nodes.get(targetID);

    source.connect(target);
}

export const disconnectNodes = (sourceID: string, targetID: string) => {
    const source = nodes.get(sourceID);
    const target = nodes.get(targetID);

    source.disconnect(target)
}

export const isRunningEngine = () => {
    return context.state === 'running'
}

export const toggleAudioEngine = () => {
    return isRunningEngine() ? context.suspend() : context.resume()
}