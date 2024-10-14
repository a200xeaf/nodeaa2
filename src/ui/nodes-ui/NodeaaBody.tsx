import {FC, memo, ReactNode} from "react";

interface NodeContainerProps {
    children: ReactNode;
    size: number
    bgColor?: string
}

const NodeaaBody: FC<NodeContainerProps> = ({children, size, bgColor = 'bg-white'}) => {
    return (
        <div className={`flex flex-col justify-center nodrag cursor-default ${bgColor} p-2 h-[${size}rem] rounded-b-xl`}>
            {children}
        </div>
    )
}
export default memo(NodeaaBody)
