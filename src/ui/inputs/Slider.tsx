import { useEffect, useRef, memo, FC, useMemo } from "react";
import p5 from "p5";
import { scaleExp } from "@/engine/utils/number-operations.ts";
import { nanoid } from "nanoid";
import { mainemitter } from "@/engine/utils/eventbus.ts";
import { BaseUIEvent } from "@/engine/types/ui-types.ts";

interface SliderProps {
    id: string;
    value: number;
    min_value: number;
    max_value: number;
    default_value: number;
    callback: (id: string, value: number) => void;
    length?: number;
    scale_exponent?: number;
    orientation?: 'horizontal' | 'vertical';
    filled?: boolean;
}

type P5InstanceWithUpdate = p5 & { updatePosition: (newPosition: number) => void };

const Slider: FC<SliderProps> = ({
                                     id,
                                     value,
                                     min_value,
                                     max_value,
                                     default_value,
                                     callback,
                                     length = 200,
                                     scale_exponent = 1,
                                     orientation = 'horizontal',
                                     filled = false,
                                 }) => {
    const p5InstanceRef = useRef<P5InstanceWithUpdate | null>(null);
    const sketchRef = useRef<HTMLDivElement>(null);

    // Memoized functions to convert between value and position
    const valueToPosition = useMemo(() => {
        return (value: number): number => {
            return scaleExp(value, min_value, max_value, 0, 1, scale_exponent, false);
        };
    }, [min_value, max_value, scale_exponent]);

    const positionToValue = useMemo(() => {
        return (position: number): number => {
            return scaleExp(position, min_value, max_value, 0, 1, scale_exponent, true);
        };
    }, [min_value, max_value, scale_exponent]);

    useEffect(() => {
        const controllerId = nanoid();
        let position = valueToPosition(value); // Value between 0 and 1
        let isDragging = false;
        const sensitivity = 0.0057; // Reduced sensitivity

        const width = orientation === 'horizontal' ? length : 20;
        const height = orientation === 'horizontal' ? 20 : length;
        const trackLength = orientation === 'horizontal' ? width - 20 : height - 20;
        const thumbSize = 10;

        const sketch = (p: p5) => {
            p.setup = () => {
                const canvas = p.createCanvas(width, height);
                canvas.id("controller-" + controllerId);
                p.smooth();
                p.pixelDensity(2);
                p.clear();
                p.noLoop();
            };

            p.draw = () => {
                p.clear();

                // Draw track background
                p.stroke(200);
                p.strokeWeight(6);
                p.noFill();

                if (orientation === 'horizontal') {
                    p.line(10, p.height / 2, p.width - 10, p.height / 2);
                } else {
                    p.line(p.width / 2, 10, p.width / 2, p.height - 10);
                }

                // Draw filled part if 'filled' prop is true
                if (filled) {
                    p.stroke(p.color("#80c5ff"));
                    if (orientation === 'horizontal') {
                        const x = 10 + position * trackLength;
                        p.line(10, p.height / 2, x, p.height / 2);
                    } else {
                        const y = p.height - 10 - position * trackLength;
                        p.line(p.width / 2, p.height - 10, p.width / 2, y);
                    }
                }

                // Draw thumb
                p.fill(p.color("#60a5fa"));
                p.noStroke();

                if (orientation === 'horizontal') {
                    const x = 10 + position * trackLength;
                    const y = p.height / 2;
                    p.circle(x, y, thumbSize);
                } else {
                    const x = p.width / 2;
                    const y = p.height - 10 - position * trackLength;
                    p.circle(x, y, thumbSize);
                }
            };
        };

        // Expose method to update position from outside the sketch
        const updatePosition = (newPosition: number) => {
            position = newPosition;
            p5InstanceRef.current?.redraw();
        };

        // Handle events from the main event bus
        const handleSliderEvent = (event: BaseUIEvent) => {
            if (!p5InstanceRef.current) return;

            const p = p5InstanceRef.current;

            switch (event.type) {
                case 'mousedown':
                    isDragging = true;
                    break;
                case 'mousemove':
                    if (isDragging) {
                        p.loop();

                        // Determine movement based on orientation
                        const delta = orientation === 'horizontal' ? event.deltaX : -event.deltaY;
                        const currSens = event.shiftKey ? sensitivity / 4 : sensitivity;

                        // Update position
                        position += delta * currSens;
                        position = p.constrain(position, 0, 1);
                        p.redraw();

                        // Update value and call callback
                        const newValue = positionToValue(position);
                        callback(id, newValue);
                    }
                    break;
                case 'mouseup':
                    isDragging = false;
                    p.noLoop();
                    break;
                case 'doubleclick':
                {
                    position = valueToPosition(default_value);
                    p.redraw();
                    const newValue = positionToValue(position);
                    callback(id, newValue);
                }
                    break;
                default:
                    break;
            }
        };

        // Initialize p5 instance and store in ref
        p5InstanceRef.current = new p5(sketch, sketchRef.current as HTMLDivElement) as P5InstanceWithUpdate;
        p5InstanceRef.current.updatePosition = updatePosition;

        // Subscribe to events
        mainemitter.on("controller-" + controllerId, handleSliderEvent);

        // Cleanup on unmount
        return () => {
            p5InstanceRef.current?.remove();
            p5InstanceRef.current = null;
            mainemitter.off("controller-" + controllerId, handleSliderEvent);
        };
    }, [
        min_value,
        max_value,
        valueToPosition,
        positionToValue,
        default_value,
        id,
        callback,
        orientation,
        filled,
    ]);

    // Update the slider when the value prop changes
    useEffect(() => {
        if (p5InstanceRef.current) {
            const newPosition = valueToPosition(value);
            (p5InstanceRef.current as P5InstanceWithUpdate).updatePosition(newPosition);
        }
    }, [value, valueToPosition]);

    return (
        <div className="flex flex-col justify-center items-center">
            <div ref={sketchRef}></div>
        </div>
    );
};

export default memo(Slider);