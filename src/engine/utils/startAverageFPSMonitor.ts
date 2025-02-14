export function startAverageFPSMonitor() {
    let frameCount = 0;
    const startTime = performance.now();

    // Continuously count frames using requestAnimationFrame
    function countFrame() {
        frameCount++;
        requestAnimationFrame(countFrame);
    }
    countFrame();

    // Every second, calculate and log the average FPS since start
    setInterval(() => {
        const currentTime = performance.now();
        const elapsedSeconds = (currentTime - startTime) / 1000;
        const avgFPS = frameCount / elapsedSeconds;
        console.log("Average FPS:", avgFPS.toFixed(2));
    }, 1000);
}
