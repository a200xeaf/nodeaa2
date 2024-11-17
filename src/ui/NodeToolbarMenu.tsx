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
import React, {ChangeEvent, useEffect, useRef} from "react";
import {useReactFlow} from "@xyflow/react";
import {projectLoad, projectNew, projectSave} from "@/engine/utils/save-load.ts";

const NodeToolbarMenu = () => {
    const { setViewport } = useReactFlow();

    const createNode = useNodeStore(useShallow((state) => state.createNode));

    const graphBackground = useNodeStore(useShallow((state) => state.graphBackground));
    const setGraphBackground = useNodeStore(useShallow((state) => state.setGraphBackground));

    const isFullscreen = useNodeStore(useShallow((state) => state.isFullscreen));  // Access fullscreen state
    const setFullscreen = useNodeStore(useShallow((state) => state.setFullscreen)); // To update fullscreen state

    const setWelcomeDialog = useNodeStore(useShallow((state) => state.setWelcomeDialog));

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

    const projectInputRef = useRef<HTMLInputElement | null>(null);

    const loadProjectFromFile = async(e: ChangeEvent<HTMLInputElement>) => {
        const projectFile = e.target.files?.[0];

        if (projectFile) {
            const reader = new FileReader();
            reader.onload = async (fileEvent) => {
                const projectText = fileEvent.target?.result;

                if (typeof projectText === "string") {
                    const { success, viewport } = await projectLoad(projectText);

                    if (success && viewport) {
                        await setViewport(viewport, { duration: 500 });
                    } else {
                        console.log("Failed to load project: Check the project file structure.");
                    }
                }
            };
            reader.readAsText(projectFile);
        }
    };

    const handleLoadProject = () => {
        if (projectInputRef.current) {
            projectInputRef.current.click()
        }
    }

    const handleNewProject = () => {
        projectNew()
        setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 500 });
    }

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
                        <MenubarSeparator/>
                        <MenubarItem onClick={toggleFullscreen}>
                            {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                            <MenubarShortcut>F11</MenubarShortcut>
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
                                <MenubarItem onClick={() => createNode("faustPolyNode", undefined, true)}>Midi Synth</MenubarItem>
                                <MenubarItem onClick={() => createNode("osc2Node", undefined, true)}>Simple Oscillator</MenubarItem>
                            </MenubarSubContent>
                        </MenubarSub>
                        <MenubarSeparator/>
                        <MenubarSub>
                            <MenubarSubTrigger>Physical Instruments</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarItem onClick={() => createNode("faustKarplusNode", undefined, true)}>Karplus Synth</MenubarItem>
                            </MenubarSubContent>
                        </MenubarSub>
                        <MenubarSeparator/>
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
                                <MenubarItem onClick={() => createNode("faustDelayNode", undefined, true)}>Delay</MenubarItem>
                                <MenubarItem onClick={() => createNode("faustGainNode", undefined, true)}>Gain</MenubarItem>
                                <MenubarItem onClick={() => createNode("faustLPFNode", undefined, true)}>Lowpass Filter</MenubarItem>
                            </MenubarSubContent>
                        </MenubarSub>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger className='pointer-events-auto'>Signals</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem>Nothing yet!</MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger className='pointer-events-auto'>Data</MenubarTrigger>
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
                        <MenubarSeparator/>
                        <MenubarItem>
                            <a href='https://forms.gle/DG422ScARNp9SUJq5' target='_blank'>Feature Request Feedback</a>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger className='pointer-events-auto'>Help</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onClick={() => setWelcomeDialog(true)} className='cursor-pointer'>
                            Open Welcome Dialog
                        </MenubarItem>
                        <MenubarItem onClick={handleNewProject} className='cursor-pointer'>
                            New
                        </MenubarItem>
                        <MenubarItem onClick={projectSave} className='cursor-pointer'>
                            Save
                        </MenubarItem>
                        <MenubarItem onClick={handleLoadProject} className='cursor-pointer'>
                            Load
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
            <input type='file' onChange={loadProjectFromFile} className='hidden' ref={projectInputRef} multiple={false} accept=".nodeaa" />
        </div>
    )
}
export default React.memo(NodeToolbarMenu)
