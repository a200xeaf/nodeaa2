import {useEffect, useRef, memo, FC, useMemo} from "react";
import p5 from "p5";
import {scaleExp} from "@/engine/utils/number-operations.ts";
import {nanoid} from "nanoid";
import {mainemitter} from "@/engine/utils/eventbus.ts";
import {BaseUIEvent} from "@/engine/types/uitypes.ts";

interface KnobProps {
    id: string
    value: number
    min_value: number
    max_value: number
    default_value: number
    callback: (id: string, value: number) => void
    scale_exponent?: number
}

type P5InstanceWithUpdate = p5 & { updateAngle: (newAngle: number) => void };

const Knob: FC<KnobProps> = ({
                                        id,
                                        value,
                                        min_value,
                                        max_value,
                                        default_value,
                                        callback,
                                        scale_exponent = 1,
                                    }) => {
    //Refs for p5 canvas
    const p5InstanceRef = useRef<P5InstanceWithUpdate | null>(null) //This one holds the p5 instance
    const sketchRef = useRef<HTMLDivElement>(null) //This one is just for the <div> ref

    //Angles for knob. Start is left/end is right
    const startAngle = Math.PI / 2 + 0.785398165
    const endAngle = 2 * Math.PI + 0.785398165

    //Helper functions for angle to value conversion
    const valueToAngle = useMemo(() => {
        return (value: number): number => {
            return scaleExp(value, min_value, max_value, startAngle, endAngle, scale_exponent);
        };
    }, [min_value, max_value, startAngle, endAngle, scale_exponent]);

    const angleToValue = useMemo(() => {
        return (angle: number): number => {
            return scaleExp(angle, min_value, max_value, startAngle, endAngle, scale_exponent, true);
        };
    }, [min_value, max_value, startAngle, endAngle, scale_exponent]);

    //First useEffect. ONLY runs once per mount to create Knob/ID and store the instance inside the ref
    //Also instantiates values that will be in sketch scope when it initializes
    useEffect(() => {
        const controllerId = nanoid()
        let angle = valueToAngle(value);
        let isDragging: boolean = false;
        const sensitivity = 0.06;

        const sketch = (p: p5) => {
            const size = 50;
            const radius = size / 2.5;
            const strokeSize = size / 14;
            const needleLength = radius * 0.7;

            p.setup = () => {
                const canvas = p.createCanvas(size, size);
                canvas.id("controller-" + controllerId)
                p.smooth();
                p.pixelDensity(2);
                p.clear();
                p.noLoop();
            };

            p.draw = () => {
                p.clear();

                p.stroke(200);
                p.strokeWeight(strokeSize);
                p.noFill();

                // Draw background arc
                p.arc(
                    p.width / 2,
                    p.height / 2,
                    radius * 2,
                    radius * 2,
                    startAngle,
                    endAngle
                );
                // Draw active arc
                p.stroke(p.color("#60a5fa"));
                p.arc(
                    p.width / 2,
                    p.height / 2,
                    radius * 2,
                    radius * 2,
                    startAngle,
                    angle
                );

                const needleX = p.width / 2 + needleLength * p.cos(angle);
                const needleY = p.height / 2 + needleLength * p.sin(angle);

                p.stroke(200);
                p.line(p.width / 2, p.height / 2, needleX, needleY);
            };
        };

        // Expose method to update angle from outside the sketch
        const updateAngle = (newAngle: number) => {
            angle = newAngle;
            p5InstanceRef.current?.redraw();
        }

        // Handle events from app.tsx
        const handleKnobEvent = (event: BaseUIEvent) => {
            if (!p5InstanceRef.current) return;

            const p = p5InstanceRef.current;

            switch (event.type) {
                case 'mousedown':
                    isDragging = true;
                    break;
                case 'mousemove':
                    if (isDragging) {
                        p.loop();

                        const deltaY = event.deltaY;
                        const currSens = event.shiftKey ? sensitivity / 4 : sensitivity;

                        if (deltaY < 0) {
                            angle += currSens * Math.abs(deltaY / 2);
                        } else if (deltaY > 0) {
                            angle -= currSens * Math.abs(deltaY / 2);
                        }

                        angle = p.constrain(angle, startAngle, endAngle);

                        // Update the knob display
                        p.redraw();

                        // Update value and call callback
                        const newValue = angleToValue(angle);
                        callback(id, newValue);
                    }
                    break;
                case 'mouseup':
                    isDragging = false;
                    p.noLoop();
                    break;
                case 'doubleclick':
                    { angle = valueToAngle(default_value);
                    p.redraw();
                    const newValue = angleToValue(angle);
                    callback(id, newValue);
                    break; }
                default:
                    break;
            }
        };

        //INITIALIZE CANVAS: p5 instance created and stored as p5InstanceRef
        p5InstanceRef.current = new p5(sketch, sketchRef.current as HTMLDivElement) as P5InstanceWithUpdate;
        p5InstanceRef.current.updateAngle = updateAngle

        mainemitter.on("controller-" + controllerId, handleKnobEvent)

        return () => {
            p5InstanceRef.current?.remove();
            p5InstanceRef.current = null;
            mainemitter.off(controllerId, handleKnobEvent)
        };
    }, [min_value, max_value, valueToAngle, angleToValue, default_value, id, callback]);

    // Update the knob when the value prop changes
    useEffect(() => {
        if (p5InstanceRef.current) {
            const newAngle = valueToAngle(value);
            (p5InstanceRef.current as P5InstanceWithUpdate).updateAngle(newAngle);
        }
    }, [value, valueToAngle]);

    return (
        <div className="flex flex-col justify-center items-center">
            <div ref={sketchRef}></div>
        </div>
    );
};

export default memo(Knob);