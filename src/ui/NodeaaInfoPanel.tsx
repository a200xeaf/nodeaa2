import { FC } from "react";
import {InfoObject} from "@/engine/types/info-map.ts";

interface NodeaaInfoPanelProps {
    idInfo: InfoObject | null;
}

const NodeaaInfoPanel: FC<NodeaaInfoPanelProps> = ({ idInfo }) => {
    return (
        <div className="absolute bg-white w-64 h-52 drop-shadow-lg left-10 bottom-10 z-[9999] rounded-lg p-4 space-y-3">
            <div className="space-y-2">
                <h2 className="font-semibold text-gray-800 text-lg">
                    {idInfo ? idInfo.name : <span className="text-gray-300">Name</span>}
                </h2>
                <p className="text-gray-500 text-xs">
                    <em>
                        {idInfo
                            ? `${idInfo.type}${idInfo.parent ? ` → ${idInfo.parent}` : ""} → ${idInfo.name}`
                            : <span className="text-gray-300">Type → Parent → Name</span>
                        }
                    </em>
                </p>
            </div>

            <hr className="border-gray-300"/>

            <div className="text-sm text-gray-700">
                <p>{idInfo ? idInfo.description : <span className="text-gray-300">Description..</span>}</p>
            </div>
        </div>
    );
};

export default NodeaaInfoPanel;