import React, {memo, useEffect, useRef} from "react";
import p5 from "p5";

interface PianoKeyboardProps {
    startNote?: number;     // MIDI note number where the keyboard starts
    numKeys?: number;       // Total number of keys to display
    keyWidth?: number;      // Width of each key
    keyHeight?: number;     // Height of the keys
    heldNotes?: number[];   // MIDI note numbers of currently held notes
    textSize?: number;
}

const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
                                                         startNote = 48,          // Default to Middle C (MIDI note 60)
                                                         numKeys = 24,
                                                         keyWidth = 40,
                                                         keyHeight = 150,
                                                         heldNotes = [],
                                                         textSize = 10,
                                                     }) => {
    const sketchRef = useRef<HTMLDivElement>(null);
    const p5InstanceRef = useRef<p5 | null>(null);

    useEffect(() => {
        const sketch = (p: p5) => {
            const keyTypesInOctave = [
                { noteName: "C", isBlack: false },
                { noteName: "C#", isBlack: true },
                { noteName: "D", isBlack: false },
                { noteName: "D#", isBlack: true },
                { noteName: "E", isBlack: false },
                { noteName: "F", isBlack: false },
                { noteName: "F#", isBlack: true },
                { noteName: "G", isBlack: false },
                { noteName: "G#", isBlack: true },
                { noteName: "A", isBlack: false },
                { noteName: "A#", isBlack: true },
                { noteName: "B", isBlack: false },
            ];

            interface KeyInfo {
                midiNote: number;
                isBlack: boolean;
                x: number;
                noteName: string;
            }

            p.setup = () => {
                let totalWhiteKeys = 0;
                for (let i = 0; i < numKeys; i++) {
                    const midiNote = startNote + i;
                    const noteInOctave = midiNote % 12;
                    const keyInfo = keyTypesInOctave[noteInOctave];
                    if (!keyInfo.isBlack) {
                        totalWhiteKeys += 1;
                    }
                }
                p.smooth();
                p.pixelDensity(2);
                p.createCanvas(totalWhiteKeys * keyWidth, keyHeight);
                p.noLoop();
                drawKeys();
            };

            const drawKeys = () => {
                p.background(255);

                const whiteKeys: KeyInfo[] = [];
                const blackKeys: KeyInfo[] = [];
                let whiteKeyX = 0;
                let lastWhiteKeyX = 0;

                // Build key information arrays
                for (let i = 0; i < numKeys; i++) {
                    const midiNote = startNote + i;
                    const noteInOctave = midiNote % 12;
                    const octave = Math.floor(midiNote / 12) - 1;
                    const keyInfo = keyTypesInOctave[noteInOctave];
                    const noteName = `${keyInfo.noteName}${octave}`;

                    if (!keyInfo.isBlack) {
                        // White key
                        const x = whiteKeyX;
                        whiteKeys.push({ midiNote, isBlack: false, x, noteName });
                        lastWhiteKeyX = whiteKeyX;
                        whiteKeyX += keyWidth;
                    } else {
                        // Black key
                        // Position black key between previous and next white keys
                        const x = lastWhiteKeyX + keyWidth - (keyWidth * 0.3);
                        blackKeys.push({ midiNote, isBlack: true, x, noteName });
                    }
                }

                // Draw white keys
                p.stroke(0);
                for (const key of whiteKeys) {
                    p.strokeWeight(2.5)
                    // Check if the key is held
                    const isHeld = heldNotes.includes(key.midiNote);
                    p.fill(isHeld ? p.color(0, 160, 255) : p.color(255));
                    p.rect(key.x, 0, keyWidth, keyHeight);

                    // Label white key
                    p.strokeWeight(1)
                    p.fill(0);
                    p.textFont("Arial");
                    p.textSize(textSize);
                    p.textAlign(p.CENTER, p.BOTTOM);
                    p.text(
                        key.noteName,
                        key.x + keyWidth / 2,
                        keyHeight - 5
                    );
                }

                // Draw black keys
                for (const key of blackKeys) {
                    p.strokeWeight(2.5)
                    // Check if the key is held
                    if (key === blackKeys[blackKeys.length - 1] && key.midiNote === (startNote + numKeys - 1)) {
                        break;
                    }
                    const isHeld = heldNotes.includes(key.midiNote);
                    const blackKeyWidth = keyWidth * 0.6;
                    const blackKeyHeight = keyHeight * 0.6;
                    p.fill(isHeld ? p.color(0, 0, 255) : p.color(0));
                    p.noStroke();
                    p.rect(
                        key.x - blackKeyWidth / 2 + keyWidth * 0.3,
                        0,
                        blackKeyWidth,
                        blackKeyHeight
                    );

                    p.strokeWeight(1)
                    // Label black key
                    p.fill(255);
                    p.textFont("Arial");
                    p.textSize(textSize);
                    p.textAlign(p.CENTER, p.BOTTOM);
                    p.text(
                        key.noteName,
                        key.x + keyWidth * 0.3,
                        blackKeyHeight - 5
                    );
                }
            };
        };

        p5InstanceRef.current = new p5(sketch, sketchRef.current as HTMLElement);

        return () => {
            p5InstanceRef.current?.remove();
            p5InstanceRef.current = null;
        };
    }, [startNote, numKeys, keyWidth, keyHeight, heldNotes]);

    return <div ref={sketchRef}></div>;
};

export default memo(PianoKeyboard);