import {FC, memo, ReactNode} from "react";

interface NodeContainerProps {
    selected: boolean | undefined;
    children: ReactNode;
    height: number;
    width: number;
    infoID?: string;
}

const NodeaaContainer: FC<NodeContainerProps> = ({ selected, children, width, height, infoID }) => {
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
            data-info-panel-id={infoID}
        >
            {children}
        </div>
    );
};

export default memo(NodeaaContainer);