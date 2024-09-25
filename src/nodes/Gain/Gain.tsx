// ./src/nodes/Osc.tsx
import React, { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useNodeStore } from '../../engine/store.ts';

interface GainProps {
    id: string
    data: {
        gain_gain: number
    };
}

const Gain: React.FC<GainProps> = ({ id, data }) => {
    const updateNode = useNodeStore((state) => state.updateNode);

    const gainInDecibels = data.gain_gain > 0
        ? (20 * Math.log10(data.gain_gain))
        : -Infinity; // Handle zero gain case

    const setGain = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            updateNode(id, { gain_gain: +e.target.value });
        },
        [id, updateNode]
    );

    return (
        <div className='w-60 h-[7rem] drop-shadow-lg'>
            <Handle type="target" position={Position.Top} />

            <div className='flex items-center bg-green-500 h-[2rem] px-1'>
                <p className='font-bold text-white'>Gain</p>
            </div>
            <div className='flex flex-col justify-center nodrag cursor-default bg-white p-2 h-[5rem]'>
                <label>
                    <span>Gain:</span>
                    <input
                        className="nodrag"
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={data.gain_gain}
                        onChange={setGain}
                    />
                </label>
                <span>{gainInDecibels === -Infinity ? `${gainInDecibels.toFixed(2)} ` : gainInDecibels.toFixed(2)}dB</span>
            </div>

            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

export default Gain;
