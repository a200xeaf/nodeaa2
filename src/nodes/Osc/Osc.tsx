// ./src/nodes/Osc.tsx
import React, { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useNodeStore } from '../../engine/store.ts';

interface OscProps {
    id: string;
    data: {
        frequency: number;
        type: string;
    };
}

const Osc: React.FC<OscProps> = ({ id, data }) => {
    const updateNode = useNodeStore((state) => state.updateNode);

    const setFrequency = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            updateNode(id, { frequency: +e.target.value });
        },
        [id, updateNode]
    );

    const setType = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            updateNode(id, { type: e.target.value.toString() });
        },
        [id, updateNode]
    );

    return (
        <div className='w-60 h-52 drop-shadow-lg'>
            <div className='flex items-center bg-pink-500 h-[2rem] px-1'>
                <p className='font-bold text-white'>Oscillator Node</p>
            </div>
            <div className='flex flex-col nodrag cursor-default bg-white p-2 h-[11rem]'>
                <label>
                    <span>Frequency:</span>
                    <input
                        className="nodrag"
                        type="range"
                        min="10"
                        max="1000"
                        value={data.frequency}
                        onChange={setFrequency}
                    />
                    <span>{data.frequency}Hz</span>
                </label>

                <hr className='my-2'/>

                <label className='flex flex-col'>
                    <span>Waveform:</span>
                    <select className="nodrag" value={data.type} onChange={setType}>
                        <option value="sine">sine</option>
                        <option value="triangle">triangle</option>
                        <option value="sawtooth">sawtooth</option>
                        <option value="square">square</option>
                    </select>
                </label>
            </div>

            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

export default Osc;
