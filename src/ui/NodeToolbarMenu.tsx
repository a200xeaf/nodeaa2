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
        <div className='absolute flex gap-x-6 z-[9999] h-16 w-full top-0 left-0 pt-2 px-4 pointer-events-none'>
            <Menubar className='py-[1.2rem]'>
                <MenubarMenu>
                    <MenubarTrigger className='pointer-events-auto'>Edit</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem>Nothing yet!</MenubarItem>
                        {/*<MenubarItem>*/}
                        {/*    Undo <MenubarShortcut>⌘Z</MenubarShortcut>*/}
                        {/*</MenubarItem>*/}
                        {/*<MenubarItem>*/}
                        {/*    Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>*/}
                        {/*</MenubarItem>*/}
                        {/*<MenubarSeparator />*/}
                        {/*<MenubarSub>*/}
                        {/*    <MenubarSubTrigger>Find</MenubarSubTrigger>*/}
                        {/*    <MenubarSubContent>*/}
                        {/*        <MenubarItem>Search the web</MenubarItem>*/}
                        {/*        <MenubarSeparator />*/}
                        {/*        <MenubarItem>Find...</MenubarItem>*/}
                        {/*        <MenubarItem>Find Next</MenubarItem>*/}
                        {/*        <MenubarItem>Find Previous</MenubarItem>*/}
                        {/*    </MenubarSubContent>*/}
                        {/*</MenubarSub>*/}
                        {/*<MenubarSeparator />*/}
                        {/*<MenubarItem>Cut</MenubarItem>*/}
                        {/*<MenubarItem>Copy</MenubarItem>*/}
                        {/*<MenubarItem>Paste</MenubarItem>*/}
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger className='pointer-events-auto'>View</MenubarTrigger>
                    <MenubarContent>
                        <MenubarSub>
                            <MenubarSubTrigger>Background</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarRadioGroup value={graphBackground} onValueChange={setGraphBackground}>
                                    <MenubarRadioItem value="lines">Lines</MenubarRadioItem>
                                    <MenubarRadioItem value="dots">Dots</MenubarRadioItem>
                                    <MenubarRadioItem value="crosses">Crosses</MenubarRadioItem>
                                    <MenubarRadioItem value="none">None</MenubarRadioItem>
                                </MenubarRadioGroup>
                            </MenubarSubContent>
                        </MenubarSub>
                        <MenubarSeparator />
                        <MenubarItem onClick={toggleFullscreen}>
                            {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'} <MenubarShortcut>F11</MenubarShortcut>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
            <Menubar className='py-[1.2rem]'>
                <MenubarMenu>
                    <MenubarTrigger className='pointer-events-auto'>Instruments</MenubarTrigger>
                    <MenubarContent>
                        <MenubarSub>
                            <MenubarSubTrigger>Synths</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarItem onClick={() => createNode("faustPolyNode", undefined, true)}>Simple Poly</MenubarItem>
                                <MenubarItem onClick={() => createNode("osc2Node", undefined, true)}>Simple Oscillator Node</MenubarItem>
                            </MenubarSubContent>
                        </MenubarSub>
                        <MenubarSeparator />
                        <MenubarSub>
                            <MenubarSubTrigger>Physical Instruments</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarItem>Nothing yet!</MenubarItem>
                            </MenubarSubContent>
                        </MenubarSub>
                        <MenubarSeparator />
                        <MenubarSub>
                            <MenubarSubTrigger>Samplers</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarItem>Nothing yet!</MenubarItem>
                            </MenubarSubContent>
                        </MenubarSub>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger className='pointer-events-auto'>Effects</MenubarTrigger>
                    <MenubarContent>
                        <MenubarSub>
                            <MenubarSubTrigger>Basic Effects</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarItem onClick={() => createNode("faustGainNode", undefined, true)}>Gain (Volume)</MenubarItem>
                                <MenubarItem onClick={() => createNode("faustLPFNode", undefined, true)}>Lowpass Filter</MenubarItem>
                            </MenubarSubContent>
                        </MenubarSub>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger className='pointer-events-auto'>Streams</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem>Nothing yet!</MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger className='pointer-events-auto'>Events</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem>Nothing yet!</MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
            <Menubar className='py-[1.2rem]'>
                <MenubarMenu>
                    <MenubarTrigger className='pointer-events-auto'>Feedback</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem>
                            <a href='https://forms.gle/SSrYo6Weiristi5f6' target='_blank'>Bug Report Feedback</a>
                        </MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem>
                            <a href='https://forms.gle/DG422ScARNp9SUJq5' target='_blank'>Feature Request Feedback</a>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
        </div>
    )
}
export default React.memo(NodeToolbarMenu)
