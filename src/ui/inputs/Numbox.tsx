import {useEffect, useRef, FC, memo} from "react";
import p5 from "p5";
import {mainemitter} from "@/engine/utils/eventbus.ts";
import {nanoid} from "nanoid";
import {BaseUIEvent} from "@/engine/types/uitypes.ts";

interface NumboxProps {
    id: string
    value: number
    min_value: number
    max_value: number
    default_value: number
    callback: (id: string, value: number) => void
}

type P5InstanceWithUpdate = p5 & { updateValue: (newAngle: number) => void };

const Numbox1: FC<NumboxProps> = ({id, value, min_value, max_value, default_value, callback}) => {
    const sketchRef = useRef<HTMLDivElement>(null);
    const p5InstanceRef = useRef<p5 | null>(null);

    useEffect(() => {
        const controllerId = nanoid()

        const sketch = (p: p5 & { updateValue? : (newValue: number) => void}) => {
            const size: number = 50

            let isDragging: boolean = false
            let prevY: number | null = null
            let tempVal: number = value
            const sensitivity: number = 1

            const maxDigits = 5
            const float = false

            const formatNumber = (formatMe: number) => {
                let final: string;

                // Round the number appropriately
                formatMe = float ? parseFloat(formatMe.toFixed(2)) : Math.floor(formatMe);
                const isNegative = formatMe < 0;

                // Handle absolute value
                let absValue = Math.abs(formatMe).toString();

                // Ensure that floating numbers have exactly two decimal places
                if (float) {
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

            p.setup = () => {
                p.createCanvas(size, size / 2)
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
                p.text(formatNumber(tempVal), p.width * 0.1, p.height * 0.72)
            }

            p.mousePressed = () => {
                if (
                    p.mouseX >= 0 &&
                    p.mouseX <= p.width &&
                    p.mouseY >= 0 &&
                    p.mouseY <= p.height
                ) {
                    isDragging = true;
                    prevY = p.mouseY;
                }
            }

            p.mouseReleased = () => {
                isDragging = false;
                prevY = null
            }

            p.mouseDragged = () => {
                if (isDragging && prevY !== null) {
                    const deltaY = p.mouseY - prevY;

                    const currSens = p.keyIsDown(p.SHIFT) ? sensitivity / 4 : sensitivity

                    if (deltaY < 0) {
                        tempVal += currSens * Math.abs(deltaY / 2);
                    } else if (deltaY > 0) {
                        tempVal -= currSens * Math.abs(deltaY / 2);
                    }

                    tempVal = p.constrain(tempVal, min_value, max_value)

                    prevY = p.mouseY;

                    callback(id, tempVal);
                    p.redraw()
                }
            }

            p.doubleClicked = () => {
                if (
                    p.mouseX >= 0 &&
                    p.mouseX <= p.width &&
                    p.mouseY >= 0 &&
                    p.mouseY <= p.height
                ) {
                    tempVal = default_value;
                    callback(id, tempVal);
                }
            }

            p.updateValue = (newValue: number) => {
                tempVal = newValue
                p.redraw()
            }
        }

        const handleNumboxEvent = (e: BaseUIEvent) => {
            console.log(e)
        }

        p5InstanceRef.current = new p5(sketch, sketchRef.current as HTMLElement);

        mainemitter.on("controller-" + controllerId, handleNumboxEvent)

        return () => {
            p5InstanceRef.current?.remove();
            p5InstanceRef.current = null;
            mainemitter.off(controllerId, handleNumboxEvent)
        };
    }, [])

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
export default memo(Numbox1)