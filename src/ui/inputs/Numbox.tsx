import {useEffect, useRef, FC, memo} from "react";
import p5 from "p5";
import {mainemitter} from "@/engine/utils/eventbus.ts";
import {nanoid} from "nanoid";
import {BaseUIEvent} from "@/engine/types/ui-types.ts";

interface NumboxProps {
    id: string
    value: number
    min_value: number
    max_value: number
    default_value: number
    float: boolean
    callback: (id: string, value: number) => void
}

type P5InstanceWithUpdate = p5 & { updateValue: (newAngle: number) => void };

const Numbox: FC<NumboxProps> = ({id, value, min_value, max_value, default_value, float, callback}) => {
    const sketchRef = useRef<HTMLDivElement>(null);
    const p5InstanceRef = useRef<P5InstanceWithUpdate | null>(null);

    useEffect(() => {
        const controllerId = nanoid()
        let currVal: number = value
        let isDragging: boolean = false
        const sensitivity: number = 0.01
        const maxDigits = 5
        const currFloat = float

        const sketch = (p: p5 & { updateValue? : (newValue: number) => void}) => {
            const size: number = 50

            p.setup = () => {
                const canvas = p.createCanvas(size, size / 2)
                canvas.id("controller-" + controllerId)
                p.smooth();
                p.pixelDensity(2);
                p.noLoop();
            }

            p.draw = () => {
                p.clear()
                p.noFill()
                p.stroke(200)
                p.strokeWeight(3)
                p.rect(0, 0, size, size / 2)
                p.noStroke()
                p.fill(0)
                p.textFont("Arial")
                p.textSize(size * 0.3)
                p.text(formatNumber(currVal), p.width * 0.1, p.height * 0.72)
            }
        }

        const formatNumber = (formatMe: number) => {
            let final: string;

            // Round the number appropriately
            formatMe = currFloat ? parseFloat(formatMe.toFixed(2)) : Math.floor(formatMe);
            const isNegative = formatMe < 0;

            // Handle absolute value
            let absValue = Math.abs(formatMe).toString();

            // Ensure that floating numbers have exactly two decimal places
            if (currFloat) {
                if (!absValue.includes('.')) {
                    absValue += '.00';
                } else {
                    const parts = absValue.split('.');
                    let decimalPart = parts[1];
                    if (decimalPart.length === 1) {
                        decimalPart += '0';
                    } else if (decimalPart.length > 2) {
                        decimalPart = decimalPart.slice(0, 2);
                    }
                    absValue = parts[0] + '.' + decimalPart;
                }
            }

            // Construct the full formatted string including the negative sign if necessary
            final = isNegative ? `\u2212${absValue}` : absValue;

            // If the length (including negative sign) exceeds maxDigits, truncate and add ellipsis
            if (final.length > maxDigits) {
                final = final.slice(0, maxDigits - 1) + '\u2025'; // Add ellipsis character
            }

            // Pad the number with figure spaces to ensure alignment
            const totalPadding = maxDigits - final.length;
            if (totalPadding > 0) {
                final = final.padStart(final.length + totalPadding, '\u2007');
            }

            return final;
        };

        const updateValue = (newValue: number) => {
            currVal = newValue
            p5InstanceRef.current?.redraw()
        }

        const handleNumboxEvent = (event: BaseUIEvent) => {
            console.log("numbox")
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
                            currVal += currSens * Math.abs(deltaY / 2);
                        } else if (deltaY > 0) {
                            currVal -= currSens * Math.abs(deltaY / 2);
                        }

                        currVal = p.constrain(currVal, min_value, max_value)

                        // Update the knob display
                        p.redraw();

                        callback(id, currVal);
                    }
                    break;
                case 'mouseup':
                    isDragging = false;
                    p.noLoop();
                    break;
                case 'doubleclick':
                    currVal = default_value
                    callback(id, default_value)
                    break;
                default:
                    break;
            }
        }

        p5InstanceRef.current = new p5(sketch, sketchRef.current as HTMLElement) as P5InstanceWithUpdate;
        p5InstanceRef.current.updateValue = updateValue

        mainemitter.on("controller-" + controllerId, handleNumboxEvent)

        return () => {
            p5InstanceRef.current?.remove();
            p5InstanceRef.current = null;
            mainemitter.off(controllerId, handleNumboxEvent)
        };
    }, [callback, default_value, id, max_value, min_value])

    useEffect(() => {
        if (p5InstanceRef.current) {
            (p5InstanceRef.current as P5InstanceWithUpdate).updateValue(value);
        }
    }, [value]);

    return (
        <div className="flex flex-col justify-center items-center">
            <div ref={sketchRef}></div>
        </div>
    )
}
export default memo(Numbox)