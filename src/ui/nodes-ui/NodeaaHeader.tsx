import {FC, memo} from "react";

interface HeaderBarProps {
    nodeName: string
    headerColor: string
}

const NodeaaHeader: FC<HeaderBarProps> = ({nodeName, headerColor}) => {
    return (
        <div className={`flex items-center ${headerColor} h-[2rem] px-1 rounded-t-xl`}>
            <p className='font-bold text-white'>{nodeName}</p>
        </div>
    )
}
export default memo(NodeaaHeader)
