import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';
import {useShallow} from "zustand/react/shallow";
import {useNodeStore} from "../../engine/store.ts";

const AnimatedGreenDashedEdge = ({
                                     id,
                                     sourceX,
                                     sourceY,
                                     targetX,
                                     targetY,
                                     sourcePosition,
                                     targetPosition,
                                     style = {},
                                     markerEnd,
                                 }: EdgeProps) => {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const dashAnimationDuration = 1;  // Duration of the dash animation

    // Access the isRunning state from your Zustand store
    const isRunning = useNodeStore(useShallow((state) => state.isRunning));

    return (
        <>
            {/* Background Grey Cable */}
            <BaseEdge
                id={`${id}-background`}
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    stroke: '#505050', // Grey color for the "cable"
                    strokeWidth: 4,    // Adjust to make the cable thicker
                }}
            />

            {/* Moving Green Dashes */}
            <BaseEdge
                id={id}
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    stroke: 'rgb(50, 250, 50)',        // Green dashes
                    strokeWidth: 4,           // Slightly thinner than the grey background
                    strokeDasharray: '8,8',   // Dash pattern
                    animation: `dash ${dashAnimationDuration}s linear infinite`,
                    animationPlayState: isRunning ? 'running' : 'paused',  // Pause/resume animation
                }}
            />

            <style>
                {`@keyframes dash {
          to {
            stroke-dashoffset: -16;  // Animation for moving the dashes
          }
        }`}
            </style>
        </>
    );
};

export default AnimatedGreenDashedEdge;