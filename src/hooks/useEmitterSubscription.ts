import {Connection} from "@xyflow/react";
import {useEffect} from "react";
import {mainemitter} from "../engine/eventbus.ts";

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
        connections.forEach(({ source, sourceHandle }) => {
            const emitterName = `${source}:${sourceHandle?.replace("data-", "")}`;
            const unsubscribe = subscribeToEmitter(emitterName);
            activeSubscriptions.push(unsubscribe);
        });

        // Cleanup function to unsubscribe from all subscriptions
        return () => {
            activeSubscriptions.forEach((unsubscribe) => unsubscribe());
        };
    }, [connections, data, callback]);
}