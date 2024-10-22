import { FC, ReactNode } from "react";

interface NodeContainerProps {
    selected: boolean | undefined;
    children: ReactNode;
    height: number;
    width: number;
}

const NodeaaContainer: FC<NodeContainerProps> = ({ selected, children, width, height }) => {
    return (
        <div
            className="drop-shadow-lg rounded-xl"
            style={{
                width: `${width}rem`,   // Set dynamic width
                height: `${height}rem`, // Set dynamic height
                boxShadow: selected
                    ? '0 0 5px 2px rgba(59, 130, 246, 0.5)'  // Thicker shadow with lower opacity
                    : 'none',  // No shadow if not selected
            }}
        >
            {children}
        </div>
    );
};

export default NodeaaContainer;