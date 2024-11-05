export interface NodeaaViewport {
    x: number;
    y: number;
    zoom: number;
}

export interface NodeaaGraphBackground {
    type: "lines" | "dots" | "crosses" | "none"
}