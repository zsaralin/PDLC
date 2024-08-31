import { imgCol, imgRow } from "./imageRatio.js";

export function animateLinearGradientSweep(pixelatedCtx) {
    const canvasHeight = imgRow;
    const visibleCanvasWidth = imgCol * 1;
    const extendedCanvasWidth = visibleCanvasWidth * 2; // Extended for smoother transition

    let gradientOffset = 0;
    let direction = 1;  // 1 for right, -1 for left
    let timeoutHandle = null;
    let delayCounter = 0;
    const delayFrames = 10; // Frames to pause at fully black/white states

    const updateGradient = () => {
        // Create gradient with sharp black-to-white transition
        let gradient = pixelatedCtx.createLinearGradient(-extendedCanvasWidth / 2 + gradientOffset, 0, extendedCanvasWidth / 2 + gradientOffset, 0);
        gradient.addColorStop(0, 'rgb(0, 0, 0)');
        gradient.addColorStop(0.35, 'rgb(0, 0, 0)');
        gradient.addColorStop(0.65, 'rgb(255, 255, 255)');
        gradient.addColorStop(1, 'rgb(255, 255, 255)');

        pixelatedCtx.fillStyle = gradient;
        pixelatedCtx.fillRect(0, 0, visibleCanvasWidth, canvasHeight);

        // Update gradient position or apply delay
        if (delayCounter > 0) {
            delayCounter--;
        } else {
            gradientOffset += direction;

            // Reverse direction and apply delay at extremes
            if (gradientOffset >= extendedCanvasWidth / 1.8) {
                direction = -1;
                delayCounter = delayFrames;
            } else if (gradientOffset <= -extendedCanvasWidth / 2) {
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
