export type BaseUIEvent =
    | { type: 'mousedown' }
    | { type: 'mousemove'; deltaY: number; shiftKey: boolean }
    | { type: 'mouseup' }
    | { type: 'doubleclick' };