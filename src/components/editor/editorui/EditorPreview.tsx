import React, { useState, useEffect, useMemo, memo } from "react";

interface FaustUIItem {
    type: string;
    label?: string;
    varname?: string;
    shortname?: string;
    address?: string;
    index?: number;
    meta?: Array<any>;
    init?: number;
    min?: number;
    max?: number;
    step?: number;
    items?: FaustUIItem[];
}

interface FaustParameters {
    ui: FaustUIItem[] | null;
}

interface FaustUIProps {
    parameters: FaustParameters | null;
    updateParameter: (address: string, value: unknown) => void;
}

const EditorPreview: React.FC<FaustUIProps> = ({ parameters, updateParameter }) => {
    // Create stable versions of parameters and uiItems.
    const safeParameters = useMemo(() => parameters ?? { ui: [] }, [parameters]);
    const uiItems = useMemo(() => safeParameters.ui ?? [], [safeParameters]);

    // Function to initialize state for interactive controls recursively.
    const initializeState = (items: FaustUIItem[]): { [key: string]: number | boolean } => {
        const state: { [key: string]: number | boolean } = {};
        const traverse = (items: FaustUIItem[]) => {
            items.forEach((item) => {
                if (item.type === "hslider" && item.varname) {
                    state[item.varname] = item.init !== undefined ? item.init : 0;
                } else if (item.type === "checkbox" && item.varname) {
                    state[item.varname] = false; // default for checkbox
                }
                if (item.items) {
                    traverse(item.items);
                }
            });
        };
        traverse(items);
        return state;
    };

    // Compute the initial state.
    const newInitialState = useMemo(() => initializeState(uiItems), [uiItems]);

    // Create control state.
    const [controlState, setControlState] = useState<{ [key: string]: number | boolean }>(newInitialState);

    // Update state when parameters change and uiItems are available.
    useEffect(() => {
        if (uiItems.length > 0) {
            setControlState(newInitialState);
        }
    }, [newInitialState, uiItems]);

    // If there are no UI items, render a fallback message.
    if (uiItems.length === 0) {
        return <div className="p-4 text-gray-500">No parameters available</div>;
    }

    // Update a control's state and log the change.
    // Now the updateControl function takes both the varname (for state) and the full address.
    const updateControl = (varname: string, address: string, value: number | boolean) => {
        setControlState((prevState) => {
            const newState = { ...prevState, [varname]: value };
            console.log(`State change: ${address} updated to ${value}`);
            updateParameter(address, value);
            return newState;
        });
    };

    // Recursively render UI items.
    const renderItem = (item: FaustUIItem, key: string): React.ReactNode => {
        switch (item.type) {
            case "vgroup":
                return (
                    <div key={key} className="flex flex-col border p-2 m-1">
                        {item.label && <div className="font-bold mb-2">{item.label}</div>}
                        {item.items && item.items.map((child, index) => renderItem(child, `${key}-${index}`))}
                    </div>
                );
            case "hgroup":
                return (
                    <div key={key} className="flex flex-row items-center border p-2 m-1">
                        {item.label && <div className="font-bold mr-2">{item.label}</div>}
                        {item.items && item.items.map((child, index) => renderItem(child, `${key}-${index}`))}
                    </div>
                );
            case "hslider": {
                // Always supply a defined value.
                const value =
                    item.varname && controlState[item.varname] !== undefined
                        ? (controlState[item.varname] as number)
                        : item.init !== undefined
                          ? item.init
                          : 0;
                return (
                    <div key={key} className="flex flex-col m-1">
                        {item.label && (
                            <label htmlFor={item.varname} className="mb-1 text-sm">
                                {item.label}
                            </label>
                        )}
                        <input
                            id={item.varname}
                            type="range"
                            value={value}
                            min={item.min}
                            max={item.max}
                            step={item.step}
                            className="w-full"
                            onChange={(e) => {
                                const newVal = parseFloat(e.target.value);
                                if (item.varname && item.address) {
                                    updateControl(item.varname, item.address, newVal);
                                }
                            }}
                            onDoubleClick={() => {
                                if (item.varname && item.address && item.init !== undefined) {
                                    updateControl(item.varname, item.address, item.init);
                                }
                            }}
                        />
                        <div className="text-xs text-gray-500">{value}</div>
                    </div>
                );
            }
            case "checkbox": {
                const checked =
                    item.varname && controlState[item.varname] !== undefined
                        ? (controlState[item.varname] as boolean)
                        : false;
                return (
                    <div key={key} className="m-1">
                        <button
                            type="button"
                            className={`px-4 py-2 rounded ${checked ? "bg-green-500" : "bg-red-500"} text-white`}
                            onClick={() => {
                                if (item.varname && item.address) {
                                    updateControl(item.varname, item.address, !checked);
                                }
                            }}
                        >
                            {item.label || item.shortname}
                        </button>
                    </div>
                );
            }
            case "hbargraph":
                // Ignore hbargraph elements.
                return null;
            default:
                return null;
        }
    };

    return <div className="w-full h-full p-4">{uiItems.map((item, index) => renderItem(item, index.toString()))}</div>;
};

export default memo(EditorPreview);
