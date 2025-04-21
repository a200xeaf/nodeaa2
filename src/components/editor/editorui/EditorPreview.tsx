import React, { useState, useEffect, useMemo, memo } from "react";

// Define the structure for individual UI elements from Faust metadata
interface FaustUIItem {
    type: string;
    label?: string;
    varname?: string;
    shortname?: string;
    address?: string; // The unique address/path for the parameter
    index?: number;
    meta?: Array<{ [key: string]: string } | any>; // Allow object with string keys or any other structure
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
                        if (
                            (item.type === "hslider" || item.type === "vslider" || item.type === "nentry") &&
                            typeof overrideValue === "number"
                        ) {
                            state[item.varname] = overrideValue;
                        } else if (
                            (item.type === "checkbox" || item.type === "button") &&
                            typeof overrideValue === "boolean"
                        ) {
                            state[item.varname] = overrideValue;
                        }
                    } else {
                        // No override: Use the 'init' value or a default
                        if (item.type === "hslider" || item.type === "vslider" || item.type === "nentry") {
                            state[item.varname] = item.init !== undefined ? item.init : 0;
                        } else if (item.type === "checkbox" || item.type === "button") {
                            state[item.varname] = item.init !== undefined ? Boolean(item.init) : false;
                        }
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
    const effectiveInitialState = useMemo(
        () => initializeState(uiItems, parametersOverride),
        [uiItems, parametersOverride],
    );

    // State to hold the current values of the interactive controls
    const [controlState, setControlState] = useState<{ [key: string]: number | boolean }>(effectiveInitialState);

    // Effect to reset the control state if the effective initial state changes
    // This ensures overrides or changes in the base parameters prop update the UI
    useEffect(() => {
        console.log("Recalculating effective initial state:", effectiveInitialState);
        setControlState(effectiveInitialState);
    }, [effectiveInitialState]); // Depend directly on the memoized initial state

    // Fixed container styles
    const containerClass = "w-[500px] h-[400px] border border-gray-300 overflow-hidden bg-white dark:bg-gray-800";

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

    // Helper to get current numeric value (state > initial > init > 0)
    const getCurrentNumericValue = (item: FaustUIItem): number => {
        // Prioritize state, then fallback to initial state (which considers overrides and init)
        const stateValue = item.varname ? controlState[item.varname] : undefined;
        if (typeof stateValue === "number") {
            return stateValue;
        }
        // effectiveInitialState already has the correct starting value (override or init)
        const initialValue = item.varname ? effectiveInitialState[item.varname] : undefined;
        if (typeof initialValue === "number") {
            return initialValue;
        }
        // Final fallback if somehow not in state or initial state
        return typeof item.init === "number" ? item.init : 0;
    };

    // Helper to get current boolean value (state > initial > init > false)
    const getCurrentBooleanValue = (item: FaustUIItem): boolean => {
        // Prioritize state, then fallback to initial state
        const stateValue = item.varname ? controlState[item.varname] : undefined;
        if (typeof stateValue === "boolean") {
            return stateValue;
        }
        // effectiveInitialState already has the correct starting value (override or init)
        const initialValue = item.varname ? effectiveInitialState[item.varname] : undefined;
        if (typeof initialValue === "boolean") {
            return initialValue;
        }
        // Final fallback
        return item.init !== undefined ? Boolean(item.init) : false;
    };

    // Helper to get the reset value for sliders/nentry (override > init > 0)
    const getResetValue = (item: FaustUIItem): number => {
        // Check if an override exists first
        const overrideValue = item.address ? parametersOverride?.[item.address] : undefined;
        if (overrideValue !== undefined && typeof overrideValue === "number") {
            return overrideValue;
        }
        // Otherwise, use the init value
        if (typeof item.init === "number") {
            return item.init;
        }
        // Fallback to 0 if no init value
        return 0;
    };

    // Helper to extract tooltip from meta array
    const getTooltip = (meta?: Array<{ [key: string]: string } | any>): string | undefined => {
        if (!meta) return undefined;
        const tooltipEntry = meta.find((entry) => typeof entry === "object" && entry !== null && "tooltip" in entry);
        return tooltipEntry?.tooltip;
    };

    // Recursively render UI items based on their type
    const renderItem = (item: FaustUIItem, key: string, options?: { isOnlyButtonChild?: boolean }): React.ReactNode => {
        const tooltip = getTooltip(item.meta); // Extract tooltip

        // --- Group Rendering ---
        if (item.type === "vgroup" || item.type === "hgroup") {
            const allItemsAreButtons = item.items?.every((child) => child.type === "button") ?? false;
            const itemsContainerClass =
                item.type === "vgroup"
                    ? `flex flex-col flex-grow space-y-1` // Vertical items, fills space
                    : `flex flex-row flex-wrap flex-grow items-start`; // Horizontal items, wraps, fills space

            return (
                <div
                    key={key}
                    className="flex flex-col border border-gray-200 dark:border-gray-600 p-2 m-1 rounded min-w-0 w-full bg-gray-50 dark:bg-gray-700"
                    title={tooltip} // Add tooltip to group container
                >
                    {/* Label always above */}
                    {item.label && (
                        <div
                            className="font-semibold mb-2 text-sm truncate text-gray-800 dark:text-gray-200"
                            title={item.label}
                        >
                            {item.label}
                        </div>
                    )}
                    {/* Container for items that fills remaining space */}
                    <div className={`${itemsContainerClass} ${allItemsAreButtons ? "flex" : ""}`}>
                        {item.items?.map((child, index) =>
                            renderItem(child, `${key}-${index}`, { isOnlyButtonChild: allItemsAreButtons }),
                        )}
                    </div>
                </div>
            );
        }

        // --- Slider Rendering ---
        if (item.type === "hslider" || item.type === "vslider") {
            const currentValue = getCurrentNumericValue(item);
            const resetValue = getResetValue(item);
            const isVertical = item.type === "vslider";

            // Base classes for the slider wrapper
            const wrapperClasses = `m-1 p-1 min-w-[60px] flex-grow flex ${isVertical ? "flex-col items-center min-h-[100px] h-full" : "flex-col"}`;

            return (
                <div key={key} className={wrapperClasses}>
                    {/* Label */}
                    {item.label && (
                        <label
                            htmlFor={item.varname}
                            className={`mb-1 text-xs font-medium truncate cursor-help text-gray-700 dark:text-gray-300 ${isVertical ? "text-center" : ""}`}
                            title={`${tooltip || item.label}\nDouble-click to reset to ${resetValue}`}
                            onDoubleClick={() => {
                                if (item.varname && item.address) {
                                    updateControl(item.varname, item.address, resetValue);
                                }
                            }}
                        >
                            {item.label}
                        </label>
                    )}
                    {/* Slider Input */}
                    <div
                        className={`flex ${isVertical ? "flex-col items-center justify-center flex-grow h-full" : "w-full"}`}
                    >
                        <input
                            id={item.varname}
                            type="range"
                            value={currentValue}
                            min={item.min ?? 0}
                            max={item.max ?? 1}
                            step={item.step ?? 0.01}
                            title={tooltip ? `${tooltip} (${currentValue.toFixed(3)})` : currentValue.toFixed(3)} // Show tooltip/value on hover
                            className={`cursor-pointer ${
                                isVertical
                                    ? "bg-gray-200 dark:bg-gray-600 rounded-lg h-32 w-2 appearance-none" // Use appearance-none for custom vertical styling
                                    : "w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer" // Horizontal
                            }`}
                            style={
                                isVertical ? { writingMode: "vertical-lr", WebkitAppearance: "slider-vertical" } : {}
                            } // Standard vertical styling where possible
                            onChange={(e) => {
                                const newVal = parseFloat(e.target.value);
                                if (item.varname && item.address) {
                                    updateControl(item.varname, item.address, newVal);
                                }
                            }}
                            onDoubleClick={() => {
                                // Also allow reset on slider double-click
                                if (item.varname && item.address) {
                                    updateControl(item.varname, item.address, resetValue);
                                }
                            }}
                        />
                    </div>
                    {/* Value Display */}
                    <div className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">
                        {currentValue.toFixed(3)}
                    </div>
                </div>
            );
        }

        // --- Numeric Entry (nentry) Rendering --- ADDED BLOCK ---
        if (item.type === "nentry") {
            const currentValue = getCurrentNumericValue(item);
            const resetValue = getResetValue(item);

            // Determine if it's an integer step
            const isInteger = (item.step ?? 1) % 1 === 0;

            return (
                <div key={key} className="m-1 p-1 min-w-[60px] flex-grow flex flex-col">
                    {/* Label */}
                    {item.label && (
                        <label
                            htmlFor={item.varname}
                            className="mb-1 text-xs font-medium truncate cursor-help text-gray-700 dark:text-gray-300"
                            title={`${tooltip || item.label}\nDouble-click to reset to ${resetValue}`}
                            onDoubleClick={() => {
                                if (item.varname && item.address) {
                                    updateControl(item.varname, item.address, resetValue);
                                }
                            }}
                        >
                            {item.label}
                        </label>
                    )}
                    {/* Input */}
                    <input
                        id={item.varname}
                        type="number"
                        value={currentValue}
                        min={item.min ?? undefined} // Pass undefined if not specified
                        max={item.max ?? undefined}
                        step={item.step ?? (isInteger ? 1 : 0.01)} // Default step based on likely type
                        title={tooltip ? `${tooltip} (${currentValue})` : String(currentValue)} // Show tooltip/value on hover
                        className="w-full p-1 border border-gray-300 dark:border-gray-500 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => {
                            const val = e.target.value;
                            // Try parsing as float first, then integer if it's supposed to be integer
                            const numVal = isInteger ? parseInt(val, 10) : parseFloat(val);

                            // Only update if parsing is successful and varname/address exist
                            if (!isNaN(numVal) && item.varname && item.address) {
                                // Optional: Clamp value within min/max if browser doesn't enforce strictly
                                let clampedVal = numVal;
                                if (item.min !== undefined) clampedVal = Math.max(item.min, clampedVal);
                                if (item.max !== undefined) clampedVal = Math.min(item.max, clampedVal);

                                updateControl(item.varname, item.address, clampedVal);
                            } else if (val === "" && item.varname && item.address) {
                                // Handle empty input case if needed (e.g., reset to min or 0?)
                                // For now, we might just let it be until a valid number is typed.
                                // Or update with a default like item.min or 0:
                                // updateControl(item.varname, item.address, item.min ?? 0);
                            }
                        }}
                        onDoubleClick={(e) => {
                            // Also allow reset on input double-click
                            e.stopPropagation(); // Prevent label's double-click if nested
                            if (item.varname && item.address) {
                                updateControl(item.varname, item.address, resetValue);
                            }
                        }}
                    />
                </div>
            );
        }
        // --- END OF nentry BLOCK ---

        // --- Button / Checkbox Rendering ---
        if (item.type === "checkbox" || item.type === "button") {
            const isChecked = getCurrentBooleanValue(item);
            // Wrapper div for layout control
            const wrapperClasses = `m-1 p-1 flex ${options?.isOnlyButtonChild ? "flex-grow basis-0 justify-center" : "items-center"}`;

            return (
                <div key={key} className={wrapperClasses}>
                    <button
                        type="button"
                        role={item.type === "checkbox" ? "switch" : "button"} // Use switch for checkbox-like toggles
                        aria-checked={item.type === "checkbox" ? isChecked : undefined} // aria-checked only for toggles
                        className={`px-3 py-1 rounded text-xs font-medium text-white truncate transition-colors duration-150 w-full ${
                            isChecked && item.type !== "button" // Only show "checked" style for toggles
                                ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                                : "bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
                        }`}
                        title={tooltip || item.label || item.shortname || item.varname} // Use tooltip if available
                        onClick={() => {
                            if (item.varname && item.address) {
                                updateControl(item.varname, item.address, !isChecked);
                                // Note: Momentary button logic (auto-release) is typically handled
                                // by how the receiving system (Faust engine via OSC/MIDI) interprets
                                // the incoming '1' message. Sending an explicit '0' might interfere
                                // if the system expects only the 'press'.
                            }
                        }}
                    >
                        {item.label || item.shortname || item.varname}
                    </button>
                </div>
            );
        }

        // --- Bargraph Rendering (Display Only) ---
        if (item.type === "hbargraph" || item.type === "vbargraph") {
            // NOTE: Bargraphs usually need real-time data fed back FROM the audio process.
            // This preview component currently only SENDS data TO the process.
            // Displaying a bargraph accurately would require a mechanism to receive
            // updates for its associated address/variable.
            // For now, just display the label as a placeholder.
            return item.label ? (
                <div
                    key={key}
                    className="m-1 p-2 text-xs italic text-gray-500 dark:text-gray-400 truncate flex-shrink-0 border border-dashed border-gray-300 dark:border-gray-600 rounded"
                    title={tooltip || item.label}
                >
                    {item.label} (Bargraph - Placeholder)
                </div>
            ) : null;
        }

        // --- Fallback for Unsupported Types ---
        console.warn("Unsupported Faust UI item type:", item.type, item);
        return (
            <div key={key} className="m-1 p-1 text-xs text-red-500 italic" title={tooltip}>
                Unsupported: {item.label || item.type}
            </div>
        );
    };

    // Main render: container with scrollable content area
    return (
        <div className={containerClass}>
            {/* Use overflow-auto for scrolling in both directions if needed */}
            <div className="p-2 overflow-auto h-full font-mono space-y-1">
                {" "}
                {/* Added space-y-1 for vertical spacing between top-level items */}
                {uiItems.map((item, index) => renderItem(item, index.toString()))}
            </div>
        </div>
    );
};

export default memo(EditorPreview);
