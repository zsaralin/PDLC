let fpsDisplay = document.getElementById('fps-display');
let frameCount = 0;
let lastFrameTime = performance.now();

export function calculateFPS(){
    const currentTime = performance.now();
    const elapsedTime = currentTime - lastFrameTime;
    if (elapsedTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / elapsedTime);
        fpsDisplay.textContent = `Processing FPS: ${fps}`;
        frameCount = 0;
        lastFrameTime = currentTime;
    }
    frameCount++;
}