import React, { useState, useEffect, useMemo, memo } from "react";

// Define the structure for individual UI elements from Faust metadata
interface FaustUIItem {
    type: string;
    label?: string;
    varname?: string;
    shortname?: string;
    address?: string; // The unique address/path for the parameter
    index?: number;
    meta?: Array<any>;
    init?: number; // Initial value from the Faust code
    min?: number;
    max?: number;
    step?: number;
    items?: FaustUIItem[]; // For group elements
}

// Define the structure for the parameters prop (derived from customNodeMetadata)
interface FaustParameters {
    ui: FaustUIItem[] | null;
}

// Define the structure for the parametersOverride prop
export interface ParameterOverrides {
    [address: string]: number | boolean; // Map parameter address to its override value
}

// Define the props for the EditorPreview component
interface FaustUIProps {
    parameters: FaustParameters | null; // Original parameters from metadata
    updateParameter: (address: string, value: unknown) => void; // Callback to update parameters externally
    parametersOverride?: ParameterOverrides; // Optional prop to override initial values
}

const EditorPreview: React.FC<FaustUIProps> = ({
    parameters,
    updateParameter,
    parametersOverride, // Destructure the new prop
}) => {
    // Memoize safe versions of parameters and uiItems to prevent unnecessary recalculations
    const safeParameters = useMemo(() => parameters ?? { ui: [] }, [parameters]);
    const uiItems = useMemo(() => safeParameters.ui ?? [], [safeParameters]);

    // Function to initialize state for interactive controls recursively,
    // considering overrides first, then the 'init' value.
    const initializeState = (
        items: FaustUIItem[],
        overrides?: ParameterOverrides,
    ): { [key: string]: number | boolean } => {
        const state: { [key: string]: number | boolean } = {};
        const traverse = (currentItems: FaustUIItem[]) => {
            currentItems.forEach((item) => {
                // Process only items with a varname (state key) and address (override key)
                if (item.varname && item.address) {
                    const overrideValue = overrides?.[item.address]; // Check if an override exists for this address

                    if (overrideValue !== undefined) {
                        // Apply override value if found and type matches roughly
                        // Ensure type consistency based on UI element type
                        if (
                            (item.type === "hslider" || item.type === "nentry") /* Add other numeric types */ &&
                            typeof overrideValue === "number"
                        ) {
                            state[item.varname] = overrideValue;
                        } else if (
                            (item.type === "checkbox" || item.type === "button") /* Add other boolean types */ &&
                            typeof overrideValue === "boolean"
                        ) {
                            state[item.varname] = overrideValue;
                        }
                        // Add more specific type checks if necessary
                    } else {
                        // No override: Use the 'init' value or a default
                        if (item.type === "hslider" || item.type === "nentry") {
                            state[item.varname] = item.init !== undefined ? item.init : 0; // Default numeric to 0 if no init
                        } else if (item.type === "checkbox" || item.type === "button") {
                            // Checkbox/Button: use init if defined (treat 0 as false, others as true), default false
                            state[item.varname] = item.init !== undefined ? Boolean(item.init) : false;
                        }
                        // Add more types if needed
                    }
                }
                // Recurse into nested items (groups)
                if (item.items) {
                    traverse(item.items);
                }
            });
        };
        traverse(items);
        return state;
    };

    // Compute the initial state, now considering parametersOverride.
    // Memoize based on uiItems and parametersOverride.
    const effectiveInitialState = useMemo(
        () => initializeState(uiItems, parametersOverride),
        [uiItems, parametersOverride], // Re-calculate if UI structure or overrides change
    );

    // State to hold the current values of the interactive controls
    const [controlState, setControlState] = useState<{ [key: string]: number | boolean }>(effectiveInitialState);

    // Effect to reset the control state if the effective initial state changes
    useEffect(() => {
        if (uiItems.length > 0) {
            setControlState(effectiveInitialState);
        }
    }, [effectiveInitialState, uiItems.length]);

    // Fixed container styles
    const containerClass = "w-[500px] h-[400px] border border-gray-300 overflow-hidden";

    // If there are no UI items, render a fallback message.
    if (uiItems.length === 0) {
        return (
            <div className={containerClass}>
                <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-500">No parameters available</span>
                </div>
            </div>
        );
    }

    // Callback to update a control's state and notify the parent component
    const updateControl = (varname: string, address: string, value: number | boolean) => {
        setControlState((prevState) => ({ ...prevState, [varname]: value }));
        console.log(`State change: ${address} updated to ${value}`);
        updateParameter(address, value); // Propagate change upwards
    };

    // Recursively render UI items based on their type
    const renderItem = (item: FaustUIItem, key: string): React.ReactNode => {
        switch (item.type) {
            case "vgroup": // Vertical group
                return (
                    <div key={key} className="flex flex-col border border-gray-200 p-2 m-1 rounded">
                        {item.label && (
                            <div className="font-semibold mb-2 text-sm truncate" title={item.label}>
                                {item.label}
                            </div>
                        )}
                        {item.items?.map((child, index) => renderItem(child, `${key}-${index}`))}
                    </div>
                );
            case "hgroup": // Horizontal group
                return (
                    <div key={key} className="flex flex-row items-center border border-gray-200 p-2 m-1 rounded">
                        {item.label && (
                            <div className="font-semibold mr-2 text-sm truncate" title={item.label}>
                                {item.label}
                            </div>
                        )}
                        <div className="flex flex-row items-center flex-wrap">
                            {item.items?.map((child, index) => renderItem(child, `${key}-${index}`))}
                        </div>
                    </div>
                );
            case "hslider": {
                // --- Start of Fix ---
                // Explicitly determine the current numeric value for the slider
                let currentValue: number = 0; // Default to 0
                const stateValue = item.varname ? controlState[item.varname] : undefined;
                const initialValue = item.varname ? effectiveInitialState[item.varname] : undefined;

                // Prioritize state value if it's a number
                if (typeof stateValue === "number") {
                    currentValue = stateValue;
                }
                // Otherwise, prioritize initial state value if it's a number
                else if (typeof initialValue === "number") {
                    currentValue = initialValue;
                }
                // Final fallback (e.g., if varname missing or types incorrect in state)
                else if (typeof item.init === "number") {
                    currentValue = item.init;
                }

                // --- End of Fix ---

                // Determine the value to reset to on double-click (override > init > 0)
                // This should always result in a number for a slider
                const resetValue =
                    item.address &&
                    parametersOverride?.[item.address] !== undefined &&
                    typeof parametersOverride[item.address] === "number"
                        ? (parametersOverride[item.address] as number) // Use override if valid number
                        : typeof item.init === "number"
                          ? item.init // Fallback to init if it's a number
                          : 0; // Final fallback

                return (
                    <div key={key} className="flex flex-col m-1 p-1 min-w-[100px] flex-grow">
                        {item.label && (
                            <label
                                htmlFor={item.varname}
                                className="mb-1 text-xs font-medium truncate"
                                title={item.label}
                            >
                                {item.label}
                            </label>
                        )}
                        <input
                            id={item.varname}
                            type="range"
                            // Now currentValue is guaranteed to be a number here
                            value={currentValue}
                            min={item.min ?? 0}
                            max={item.max ?? 1}
                            step={item.step ?? 0.01}
                            className="w-full cursor-pointer h-2 bg-gray-200 rounded-lg appearance-none dark:bg-gray-700"
                            onChange={(e) => {
                                const newVal = parseFloat(e.target.value);
                                if (item.varname && item.address) {
                                    // Pass the numeric value
                                    updateControl(item.varname, item.address, newVal);
                                }
                            }}
                            onDoubleClick={() => {
                                if (item.varname && item.address) {
                                    // Pass the numeric reset value
                                    updateControl(item.varname, item.address, resetValue);
                                }
                            }}
                        />
                        {/* Display the current value - Now safe to call .toFixed() */}
                        <div className="text-xs text-gray-600 text-center mt-1">{currentValue.toFixed(3)}</div>
                    </div>
                );
            }
            case "checkbox": // Can also represent buttons/switches acting as toggles
            case "button": { // Often used as momentary triggers, but Faust can map them to toggles
                // --- Start of Fix ---
                // Explicitly determine the current boolean value
                let isChecked: boolean = false; // Default to false
                const stateValue = item.varname ? controlState[item.varname] : undefined;
                const initialValue = item.varname ? effectiveInitialState[item.varname] : undefined;

                // Prioritize state value if it's a boolean
                if (typeof stateValue === "boolean") {
                    isChecked = stateValue;
                }
                // Otherwise, prioritize initial state value if it's a boolean
                else if (typeof initialValue === "boolean") {
                    isChecked = initialValue;
                }
                // Final fallback (e.g., using init value if defined)
                else if (item.init !== undefined) {
                    isChecked = Boolean(item.init); // Treat 0 as false, others as true
                }
                // --- End of Fix ---

                return (
                    <div key={key} className="m-1 flex items-center p-1">
                        <button
                            type="button"
                            role="switch" // Use switch role for toggle buttons
                            aria-checked={isChecked}
                            className={`px-3 py-1 rounded text-xs font-medium text-white truncate transition-colors duration-150 ${
                                isChecked ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-500 hover:bg-gray-600"
                            }`}
                            title={item.label || item.shortname || item.varname}
                            onClick={() => {
                                if (item.varname && item.address) {
                                    // Pass the toggled boolean value
                                    updateControl(item.varname, item.address, !isChecked);
                                }
                            }}
                        >
                            {item.label || item.shortname || item.varname}
                        </button>
                    </div>
                );
            }
            case "hbargraph": // Horizontal bar graph (display only)
                return item.label ? (
                    <div key={key} className="m-1 p-1 text-xs italic text-gray-500 truncate" title={item.label}>
                        {item.label} (Bargraph)
                    </div>
                ) : null;

            case "vbargraph": // Vertical bar graph (display only)
                return item.label ? (
                    <div key={key} className="m-1 p-1 text-xs italic text-gray-500 truncate" title={item.label}>
                        {item.label} (Bargraph)
                    </div>
                ) : null;

            // Add cases for other Faust UI types as needed (e.g., nentry, radio, etc.)

            default:
                console.warn("Unsupported Faust UI item type:", item.type, item);
                return null;
        }
    };

    // Main render: container with scrollable content area
    return (
        <div className={containerClass}>
            <div className="p-2 overflow-y-auto h-full bg-white dark:bg-gray-800">
                {uiItems.map((item, index) => renderItem(item, index.toString()))}
            </div>
        </div>
    );
};

export default memo(EditorPreview);
