import { imgCol, imgRow } from "./imageRatio.js";

export function animateLinearGradientSweep(pixelatedCtx) {
    const canvasWidth = imgCol;
    const visibleCanvasHeight = imgRow * 1;
    const extendedCanvasHeight = visibleCanvasHeight * 2; // Extended for smoother transition

    let gradientOffset = 0;
    let direction = 1;  // 1 for down, -1 for up
    let timeoutHandle = null;
    let delayCounter = 0;
    const delayFrames = 10; // Frames to pause at fully black/white states

    const updateGradient = () => {
        // Create gradient with sharp black-to-white transition
        let gradient = pixelatedCtx.createLinearGradient(0, -extendedCanvasHeight / 2 + gradientOffset, 0, extendedCanvasHeight / 2 + gradientOffset);
        gradient.addColorStop(0, 'rgb(0, 0, 0)');
        gradient.addColorStop(0.35, 'rgb(0, 0, 0)');
        gradient.addColorStop(0.65, 'rgb(255, 255, 255)');
        gradient.addColorStop(1, 'rgb(255, 255, 255)');

        pixelatedCtx.fillStyle = gradient;
        pixelatedCtx.fillRect(0, 0, canvasWidth, visibleCanvasHeight);

        // Update gradient position or apply delay
        if (delayCounter > 0) {
            delayCounter--;
        } else {
            gradientOffset += direction;

            // Reverse direction and apply delay at extremes
            if (gradientOffset >= extendedCanvasHeight / 1.8) {
                direction = -1;
                delayCounter = delayFrames;
            } else if (gradientOffset <= -extendedCanvasHeight / 2) {
                direction = 1;
                delayCounter = delayFrames;
            }
        }

        // Schedule next update with dynamic interval
        timeoutHandle = setTimeout(updateGradient, parseFloat(document.getElementById('animSpeed').value));
    };

    updateGradient(); // Start the animation

    // Return function to stop the animation
    return () => {
        clearTimeout(timeoutHandle);
    };
}