import {
    AlertDialog, AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog.tsx";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel.tsx";
import {useNodeStore} from "@/engine/store.ts";
import {useShallow} from "zustand/react/shallow";
import {memo} from "react";

const NodeaaWelcome = () => {
    const welcomeDialog = useNodeStore(useShallow((state) => state.welcomeDialog));
    const setWelcomeDialog = useNodeStore(useShallow((state) => state.setWelcomeDialog));
    return (
        <AlertDialog defaultOpen={true} open={welcomeDialog} onOpenChange={setWelcomeDialog}>
            <AlertDialogContent
                className="absolute z-[9999] w-[90%] max-w-[1000px] max-h-[90vh] min-w-[100px] min-h-[20px]"
            >
                <AlertDialogHeader className='items-center'>
                    <AlertDialogTitle className="inline-block w-fit text-4xl font-bold text-center select-none
                    bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent animate-gradient bg-[length:150%_150%]"
                    >
                        Welcome to Nodeaa
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center select-none">Get started with this quick guide</AlertDialogDescription>

                    {/* Responsive Carousel */}
                    <Carousel className="w-full h-full">
                        <CarouselContent>
                            {/* First Slide */}
                            <CarouselItem className="h-full flex flex-col md:flex-row items-center">
                                <div className="w-full md:w-1/3 text-left p-4">
                                    <h3 className="text-2xl font-semibold select-none">Creating Nodes</h3>
                                    <p className="text-md text-gray-600 mt-2 select-none">
                                        Pressing the <em><strong>N</strong></em> key on the grid will bring up the Node search box.
                                        Type in the name of the node to create and either select one of the options
                                        or press enter to get the top selected option. Nodes can be dragged by the
                                        title bar at their tops. Nodes can be selected by clicking anywhere on them.
                                    </p>
                                </div>
                                <div className="w-full md:w-2/3 flex items-center justify-center p-4 md:p-10">
                                    <video
                                        className="w-full h-auto max-w-[800px] lg:max-h-[500px] object-cover rounded-lg shadow-lg"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                    >
                                        <source src="/assets/videos/welcome/slide1.webm" type="video/webm" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            </CarouselItem>

                            {/* Second Slide */}
                            <CarouselItem className="h-full flex flex-col md:flex-row items-center">
                                <div className="w-full md:w-2/3 flex items-center justify-center p-4 md:p-10">
                                    <video
                                        className="w-full h-auto max-w-[800px] md:max-w-[1136px] max-h-[500px] md:max-h-[720px] object-cover rounded-lg shadow-lg"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                    >
                                        <source src="/assets/videos/welcome/slide2.webm" type="video/webm"/>
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                                <div className="w-full md:w-1/3 text-left p-4">
                                    <h3 className="text-2xl font-semibold select-none">Connecting Nodes</h3>
                                    <p className="text-md text-gray-600 mt-2 select-none">
                                        Connect nodes by dragging either their inlet or outlet to a same colored
                                        port on another node. This will create a wire indicating the connection is
                                        working. Select cables and press <em><strong>Backspace</strong></em> or&nbsp;
                                        <em><strong>Delete</strong></em> to disconnect the two nodes from each other.
                                    </p>
                                </div>
                            </CarouselItem>

                            {/* Third Slide */}
                            <CarouselItem className="h-full flex flex-col md:flex-row items-center">
                                <div className="w-full md:w-1/3 text-left p-4">
                                    <h3 className="text-2xl font-semibold select-none">Help Make Nodeaa Better</h3>
                                    <p className="text-md text-gray-600 mt-2 select-none">
                                        Nodeaa is still in its early development, so you may encounter incomplete
                                        functionality. Use the <em><strong>Feedback</strong></em> button in the top
                                        menu to report bugs or suggest new features.
                                    </p>
                                </div>
                                <div className="w-full md:w-2/3 flex items-center justify-center p-4 md:p-10">
                                    <video
                                        className="w-full h-auto max-w-[800px] md:max-w-[1136px] max-h-[500px] md:max-h-[720px] object-cover rounded-lg shadow-lg"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                    >
                                        <source src="/assets/videos/welcome/slide3.webm" type="video/webm"/>
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            </CarouselItem>
                        </CarouselContent>
                        <CarouselPrevious/>
                        <CarouselNext/>
                    </Carousel>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogAction>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default memo(NodeaaWelcome);