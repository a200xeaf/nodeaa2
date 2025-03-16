import { useEffect, useRef } from "react";
import debounce from "lodash.debounce";
import { useNodeStore } from "@/engine/store.ts";
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import { projectLoad } from "@/engine/utils/save-load.ts";
import { mainemitter } from "@/engine/utils/eventbus.ts";

const useUpdateUrlState = () => {
    // Ref to determine if initial project load has been completed.
    const isInitialized = useRef(false);

    // Effect to auto-save store changes to the URL (only after initial load).
    useEffect(() => {
        const updateUrl = debounce(() => {
            // Skip updating until the project is loaded.
            if (!isInitialized.current) return;

            const storeState = useNodeStore.getState();
            const projectState = JSON.stringify({
                nodes: storeState.nodes,
                edges: storeState.edges,
                viewport: storeState.viewport,
                graphBackground: storeState.graphBackground,
            });
            const compressed = compressToEncodedURIComponent(projectState);

            // Only update if the new compressed state differs from what's already in the URL.
            const currentParam = new URLSearchParams(window.location.search).get("project");
            if (currentParam === compressed) return;

            const newUrl = `${window.location.pathname}?project=${compressed}`;
            window.history.replaceState(null, "", newUrl);
        }, 1200);

        const unsubscribe = useNodeStore.subscribe(() => {
            updateUrl();
        });

        return () => {
            updateUrl.cancel();
            unsubscribe();
        };
    }, []);

    // Effect that runs only once on mount: loads project from URL, then marks initialization complete.
    useEffect(() => {
        const firstLoadProject = async () => {
            const searchParams = new URLSearchParams(window.location.search);
            const projectParam = searchParams.get("project");
            if (projectParam) {
                try {
                    const decompressedProject = decompressFromEncodedURIComponent(projectParam);
                    if (decompressedProject) {
                        // projectLoad should update your store appropriately.
                        const { success, viewport } = await projectLoad(decompressedProject);
                        if (success && viewport) {
                            mainemitter.emit("updateviewport", viewport);
                        } else {
                            console.error("Failed to load viewport", decompressedProject);
                        }
                    }
                } catch (error) {
                    console.error("Error loading project from URL", error);
                }
            }
            // Mark that initial load has completed.
            isInitialized.current = true;
        };

        firstLoadProject();
    }, []);
};

export default useUpdateUrlState;
