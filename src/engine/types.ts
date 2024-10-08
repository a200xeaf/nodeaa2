// TypeScript interface that matches the expected structure of your JSON
export interface NodeConfig {
    nodeName: string;
    idPrefix: string;
    realName: string;
    defaultData: Record<string, unknown>;
    audioNodeParams?: {
        engine: "faust" | "rnbo";
        type: string;
        voices?: number;
    };
    hasAudio: boolean;
    version: string;
}

// Define the shape of the entire configuration object
export type NodesConfig = Record<string, NodeConfig>;