const fpsDisplays = document.querySelectorAll('.fps-display');
let frameCount = [0,0]
let lastFrameTime = [performance.now(), performance.now()]

export function calculateFPS(i){
    const currentTime = performance.now();
    const elapsedTime = currentTime - lastFrameTime[i];
    if (elapsedTime >= 1000) {
        const fps = Math.round((frameCount[i] * 1000) / elapsedTime);
        fpsDisplays[i].textContent = `Processing FPS: ${fps}`;
        frameCount[i] = 0;
        lastFrameTime[i] = currentTime;
    }
    frameCount[i] += 1;
}