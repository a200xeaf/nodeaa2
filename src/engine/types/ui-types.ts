export type BaseUIEvent =
    | { type: 'mousedown' }
    | { type: 'mousemove'; deltaX: number, deltaY: number; shiftKey: boolean }
    | { type: 'mouseup' }
    | { type: 'doubleclick' };