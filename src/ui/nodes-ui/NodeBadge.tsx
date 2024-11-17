import {FC, memo} from "react";

interface BadgeProps {
    type: "midi" | "data" | "instrument" | "effect" | "unknown";
}

const Badge: FC<BadgeProps> = ({ type }) => {
    // Map types to colors and labels
    const typeMapping: Record<BadgeProps["type"], { color: string; label: string }> = {
        midi: { color: "bg-blue-400", label: "M" },
        data: { color: "bg-yellow-400", label: "D" },
        instrument: { color: "bg-green-400", label: "I" },
        effect: { color: "bg-purple-400", label: "E" },
        unknown: { color: "bg-gray-400", label: "?" },
    };

    const { color, label } = typeMapping[type] || typeMapping.unknown;

    return (
        <div
            className={`w-6 h-5 flex items-center justify-center rounded-lg text-white text-xs font-bold font-mono mr-2 ${color}`}
        >
            {label}
        </div>
    );
};

export default memo(Badge);