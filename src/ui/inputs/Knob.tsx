import {useEffect, useRef, memo, FC, useMemo} from "react";
import p5 from "p5";
import {scaleExp} from "@/utils/data/number-operations.ts";

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
    const sketchRef = useRef<HTMLDivElement>(null);

    const startAngle = Math.PI / 2 + 0.785398165; // Equivalent to p.HALF_PI + 0.785398165
    const endAngle = 2 * Math.PI + 0.785398165; // Equivalent to p.TWO_PI + 0.785398165

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

    const p5InstanceRef = useRef<p5 | null>(null);

    useEffect(() => {
        const sketch = (p: p5 & { updateAngle?: (newAngle: number) => void }) => {
            const size = 50;
            const radius = size / 2.5;
            const strokeSize = size / 14;
            const needleLength = radius * 0.7;

            let angle = valueToAngle(value); // Initialize angle based on value

            let needleX: number, needleY: number;
            let startY: number | null;

            let isDragging: boolean = false;

            const sensitivity = 0.06;

            p.setup = () => {
                p.createCanvas(size, size);
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

                // Compute needle position
                needleX = p.width / 2 + needleLength * p.cos(angle);
                needleY = p.height / 2 + needleLength * p.sin(angle);

                p.stroke(200);
                p.line(p.width / 2, p.height / 2, needleX, needleY);
            };

            p.mousePressed = () => {
                if (
                    p.mouseX >= 0 &&
                    p.mouseX <= p.width &&
                    p.mouseY >= 0 &&
                    p.mouseY <= p.height
                ) {
                    startY = p.mouseY;
                    isDragging = true;
                }
            };

            p.mouseReleased = () => {
                isDragging = false;
                startY = null;
                p.noLoop();
            };

            p.doubleClicked = () => {
                if (
                    p.mouseX >= 0 &&
                    p.mouseX <= p.width &&
                    p.mouseY >= 0 &&
                    p.mouseY <= p.height
                ) {
                    angle = valueToAngle(default_value);
                    p.redraw();
                    // Update value and call callback
                    const newValue = angleToValue(angle);
                    callback(id, newValue);
                }
            };

            p.mouseDragged = () => {
                if (isDragging && startY !== null) {
                    p.loop();
                    const deltaY = p.mouseY - startY;

                    const currSens = p.keyIsDown(p.SHIFT) ? sensitivity / 4 : sensitivity;

                    if (deltaY < 0) {
                        angle += currSens * Math.abs(deltaY / 2);
                    } else if (deltaY > 0) {
                        angle -= currSens * Math.abs(deltaY / 2);
                    }

                    angle = p.constrain(angle, startAngle, endAngle); // Ensure the angle is within range
                    calculateNeedlePosition();
                    startY = p.mouseY;

                    // Update the value based on the angle and call the callback
                    const newValue = angleToValue(angle);
                    callback(id, newValue);
                }
            };

            const calculateNeedlePosition = () => {
                needleX = p.width / 2 + needleLength * p.cos(angle);
                needleY = p.height / 2 + needleLength * p.sin(angle);
            };

            // Expose method to update angle from outside the sketch
            p.updateAngle = (newAngle: number) => {
                angle = newAngle;
                p.redraw();
            };
        };

        p5InstanceRef.current = new p5(sketch, sketchRef.current as HTMLElement);

        return () => {
            p5InstanceRef.current?.remove();
            p5InstanceRef.current = null;
        };
    }, [min_value, max_value]);

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