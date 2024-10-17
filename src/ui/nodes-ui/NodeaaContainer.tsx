import {FC, memo, ReactNode} from "react";

interface NodeContainerProps {
    selected: boolean | undefined;
    children: ReactNode;
    width: number
    height: number
}

const NodeaaContainer: FC<NodeContainerProps> = ({selected, children, width, height}) => {
    return (
        <div
            className={`w-[${width}rem] h-[${height}rem] drop-shadow-lg rounded-xl`}
            style={{
                boxShadow: selected
                    ? '0 0 5px 2px rgba(59, 130, 246, 0.5)'  // Thicker shadow with lower opacity
                    : 'none',  // No shadow if not selected
            }}
        >
            {children}
        </div>
    )
}
export default memo(NodeaaContainer)
