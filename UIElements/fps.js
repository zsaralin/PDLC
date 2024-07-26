let initialized = false;
let fpsDisplays, frameCount, lastFrameTime;

function initializeFPS() {
    if (!initialized) {
        fpsDisplays = document.querySelectorAll('.fps-display');
        frameCount = [0, 0];
        lastFrameTime = [performance.now(), performance.now()];
        initialized = true;
    }
}

export function calculateFPS(i) {
    if (!initialized) {
        initializeFPS();
    }

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
