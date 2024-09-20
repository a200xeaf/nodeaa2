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

    const setGain = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            updateNode(id, { gain_gain: +e.target.value });
        },
        [id, updateNode]
    );

    return (
        <div className='w-60 h-52 drop-shadow-lg'>
            <Handle type="target" position={Position.Top} />

            <div className='flex items-center bg-green-500 h-[2rem] px-1'>
                <p className='font-bold text-white'>Gain</p>
            </div>
            <div className='flex flex-col nodrag cursor-default bg-white p-2 h-[11rem]'>
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
                    <span>{data.gain_gain.toFixed(1)}</span>
                </label>
            </div>

            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

export default Gain;
