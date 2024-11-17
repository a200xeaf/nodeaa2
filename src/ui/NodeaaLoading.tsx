import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog.tsx";
import {useNodeStore} from "@/engine/store.ts";
import {useShallow} from "zustand/react/shallow";
import {Progress} from "@/components/ui/progress.tsx";
import {memo} from "react";

const NodeaaLoading = () => {
    const loadingStatus = useNodeStore(useShallow((state) => state.loadingStatus));
    const loadingMessage = useNodeStore(useShallow((state) => state.loadingMessage));
    const loadingProgress = useNodeStore(useShallow((state) => state.loadingProgress));
    const setLoadingStatus = useNodeStore(useShallow((state) => state.setLoadingStatus));

    return (
        <AlertDialog open={loadingStatus} onOpenChange={setLoadingStatus}>
            <AlertDialogContent
                className="absolute z-[9999] w-[40%]"
            >
                <AlertDialogHeader>
                    <AlertDialogTitle>Loading</AlertDialogTitle>
                    <Progress value={loadingProgress} />
                    <AlertDialogDescription>{loadingMessage}</AlertDialogDescription>
                </AlertDialogHeader>
            </AlertDialogContent>
        </AlertDialog>
    )
}
export default memo(NodeaaLoading)
