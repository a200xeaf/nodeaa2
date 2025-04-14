interface NodeData {
    [key: string]: string | number | boolean;
}

interface NodePosition {
    x: number;
    y: number;
}

interface NodeMeasured {
    width: number;
    height: number;
}

interface CustomNodeData {
    parameters: Record<string, number>;
    customNodeMetadata: object;
}

interface ProjectNode {
    id: string;
    type: string;
    data: NodeData | CustomNodeData;
    position: NodePosition;
    measured: NodeMeasured;
    selected?: boolean;
}

interface ProjectEdge {
    id: string;
    source: string;
    sourceHandle: string;
    target: string;
    targetHandle: string;
    type: string;
}

interface ProjectViewport {
    x: number;
    y: number;
    zoom: number;
}

export interface ProjectData {
    nodes: ProjectNode[];
    edges: ProjectEdge[];
    viewport: ProjectViewport;
    graphBackground: string;
    externalNodeLinks: string[];
}
