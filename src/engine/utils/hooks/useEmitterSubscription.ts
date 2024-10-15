import {Connection} from "@xyflow/react";
import {useEffect} from "react";
import {mainemitter} from "../eventbus.ts";

type UseEmmitterSubscriptionsProps = {
    connections: Connection[]
    callback: (e: any) => void
    data: any
}

export const useEmitterSubscriptions = ({connections, callback, data}: UseEmmitterSubscriptionsProps) => {
    useEffect(() => {
        const activeSubscriptions: (() => void)[] = [];

        // Helper function to subscribe to an emitter
        const subscribeToEmitter = (emitterName: string) => {
            mainemitter.on(emitterName, callback);
            return () => mainemitter.off(emitterName, callback);
        };

        // Subscribe to each connection
// Subscribe to each connection
        connections.forEach(({ source, sourceHandle }) => {
            let cleanedHandle = sourceHandle;

            // Check if sourceHandle starts with "data-" or "midi-" and replace
            if (sourceHandle?.startsWith("data-")) {
                cleanedHandle = sourceHandle.replace("data-", "");
            } else if (sourceHandle?.startsWith("midi-")) {
                cleanedHandle = sourceHandle.replace("midi-", "");
            }

            // Use the cleaned handle for the emitter name
            const emitterName = `${source}:${cleanedHandle}`;
            const unsubscribe = subscribeToEmitter(emitterName);
            activeSubscriptions.push(unsubscribe);
        });

        // Cleanup function to unsubscribe from all subscriptions
        return () => {
            activeSubscriptions.forEach((unsubscribe) => unsubscribe());
        };
    }, [connections, data, callback]);
}