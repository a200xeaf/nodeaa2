import {
    Menubar,
    MenubarShortcut,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
    MenubarRadioGroup,
    MenubarRadioItem
} from "@/components/ui/menubar.tsx";
import {useNodeStore} from "@/engine/store.ts";
import {useShallow} from "zustand/react/shallow";
import React, {useEffect} from "react";

const NodeToolbarMenu = () => {
    const createNode = useNodeStore(useShallow((state) => state.createNode));

    const graphBackground = useNodeStore(useShallow((state) => state.graphBackground));
    const setGraphBackground = useNodeStore(useShallow((state) => state.setGraphBackground));

    const isFullscreen = useNodeStore(useShallow((state) => state.isFullscreen));  // Access fullscreen state
    const setFullscreen = useNodeStore(useShallow((state) => state.setFullscreen)); // To update fullscreen state

    // UseEffect to watch fullscreen change
    useEffect(() => {
        const onFullscreenChange = () => {
            setFullscreen(Boolean(document.fullscreenElement));
        };

        document.addEventListener('fullscreenchange', onFullscreenChange);

        // Cleanup event listener on unmount
        return () => {
            document.removeEventListener('fullscreenchange', onFullscreenChange);
        };
    }, [setFullscreen]);

    const toggleFullscreen = useNodeStore(useShallow((state) => state.toggleFullscreen)); // To update fullscreen state

    return (
        <div className='absolute flex gap-x-6 z-[9999] h-16 w-full top-0 left-0 pt-2 px-4'>
            <Menubar className='py-[1.2rem]'>
                <MenubarMenu>
                    <MenubarTrigger>Edit</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem>
                            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem>
                            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                        </MenubarItem>
                        <MenubarSeparator />
                        <MenubarSub>
                            <MenubarSubTrigger>Find</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarItem>Search the web</MenubarItem>
                                <MenubarSeparator />
                                <MenubarItem>Find...</MenubarItem>
                                <MenubarItem>Find Next</MenubarItem>
                                <MenubarItem>Find Previous</MenubarItem>
                            </MenubarSubContent>
                        </MenubarSub>
                        <MenubarSeparator />
                        <MenubarItem>Cut</MenubarItem>
                        <MenubarItem>Copy</MenubarItem>
                        <MenubarItem>Paste</MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>View</MenubarTrigger>
                    <MenubarContent>
                        <MenubarSub>
                            <MenubarSubTrigger>Background</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarRadioGroup value={graphBackground} onValueChange={setGraphBackground}>
                                    <MenubarRadioItem value="lines">Lines</MenubarRadioItem>
                                    <MenubarRadioItem value="dots">Dots</MenubarRadioItem>
                                    <MenubarRadioItem value="crosses">Crosses</MenubarRadioItem>
                                </MenubarRadioGroup>
                            </MenubarSubContent>
                        </MenubarSub>
                        <MenubarSeparator />
                        <MenubarItem onClick={toggleFullscreen}>
                            {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'} <MenubarShortcut>F11</MenubarShortcut>
                        </MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem>Hide Sidebar</MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
            <Menubar className='py-[1.2rem]'>
                <MenubarMenu>
                    <MenubarTrigger>Instruments</MenubarTrigger>
                    <MenubarContent>
                        <MenubarSub>
                            <MenubarSubTrigger>Synths</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarItem onClick={() => createNode("faustPolyNode")}>Simple Poly</MenubarItem>
                                <MenubarItem onClick={(e) => console.log(e)}>Messages</MenubarItem>
                                <MenubarItem>Notes</MenubarItem>
                            </MenubarSubContent>
                        </MenubarSub>
                        <MenubarSeparator />
                        <MenubarSub>
                            <MenubarSubTrigger>Models</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarItem>Email link</MenubarItem>
                                <MenubarItem>Messages</MenubarItem>
                                <MenubarItem>Notes</MenubarItem>
                            </MenubarSubContent>
                        </MenubarSub>
                        <MenubarSeparator />
                        <MenubarSub>
                            <MenubarSubTrigger>Samplers</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarItem>Email link</MenubarItem>
                                <MenubarItem>Messages</MenubarItem>
                                <MenubarItem>Notes</MenubarItem>
                            </MenubarSubContent>
                        </MenubarSub>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Effects</MenubarTrigger>
                    <MenubarContent>
                        <MenubarSub>
                            <MenubarSubTrigger>Instrument</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarItem>Email link</MenubarItem>
                                <MenubarItem>Messages</MenubarItem>
                                <MenubarItem>Notes</MenubarItem>
                            </MenubarSubContent>
                        </MenubarSub>
                        <MenubarSeparator />
                        <MenubarSub>
                            <MenubarSubTrigger>Effects</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarItem>Email link</MenubarItem>
                                <MenubarItem>Messages</MenubarItem>
                                <MenubarItem>Notes</MenubarItem>
                            </MenubarSubContent>
                        </MenubarSub>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Streams</MenubarTrigger>
                    <MenubarContent>
                        <MenubarSub>
                            <MenubarSubTrigger>Instrument</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarItem>Email link</MenubarItem>
                                <MenubarItem>Messages</MenubarItem>
                                <MenubarItem>Notes</MenubarItem>
                            </MenubarSubContent>
                        </MenubarSub>
                        <MenubarSeparator />
                        <MenubarSub>
                            <MenubarSubTrigger>Effects</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarItem>Email link</MenubarItem>
                                <MenubarItem>Messages</MenubarItem>
                                <MenubarItem>Notes</MenubarItem>
                            </MenubarSubContent>
                        </MenubarSub>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Events</MenubarTrigger>
                    <MenubarContent>
                        <MenubarSub>
                            <MenubarSubTrigger>Instrument</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarItem>Email link</MenubarItem>
                                <MenubarItem>Messages</MenubarItem>
                                <MenubarItem>Notes</MenubarItem>
                            </MenubarSubContent>
                        </MenubarSub>
                        <MenubarSeparator />
                        <MenubarSub>
                            <MenubarSubTrigger>Effects</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarItem>Email link</MenubarItem>
                                <MenubarItem>Messages</MenubarItem>
                                <MenubarItem>Notes</MenubarItem>
                            </MenubarSubContent>
                        </MenubarSub>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
        </div>
    )
}
export default React.memo(NodeToolbarMenu)
