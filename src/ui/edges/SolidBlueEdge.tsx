import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';

const SolidBlueEdge = ({
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

    return (
        <BaseEdge
            id={id}
            path={edgePath}
            markerEnd={markerEnd}
            style={{
                ...style,
                stroke: 'rgb(59, 130, 246)', // Solid blue color
                strokeWidth: 4,    // Adjust the thickness
            }}
        />
    );
};

export default SolidBlueEdge;