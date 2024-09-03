import { imgCol, imgRow } from "./imageRatio.js";

export function animateFadeScreen(pixelatedCtx) {
    let fadeValue = 0;
    let fadeDirection = 1; // 1 for fading to white, -1 for fading to black
    let timeoutHandle = null;

    const updateFade = () => {
        const fadeSpeedElement = document.getElementById('fadeSpeed');
        if (!fadeSpeedElement) {
            console.error("Fade speed element not found!");
            return;
        }

        const fadeSpeed = parseFloat(fadeSpeedElement.value) / 1000;
        console.log(`Fade Speed: ${fadeSpeed}, Fade Value: ${fadeValue}, Direction: ${fadeDirection}`);

        // Update the fade value
        fadeValue += fadeDirection * fadeSpeed;

        // Clamp the fade value and reverse direction if limits are reached
        if (fadeValue >= 1) {
            fadeValue = 1;
            fadeDirection = -1; // Start fading to black
        } else if (fadeValue <= 0) {
            fadeValue = 0;
            fadeDirection = 1; // Start fading to white
        }

        // Calculate the current color based on fadeValue
        const colorValue = Math.round(255 * fadeValue);
        const color = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;

        // Fill the canvas with the current color
        pixelatedCtx.fillStyle = color;
        pixelatedCtx.fillRect(0, 0, imgCol, imgRow);

        // Schedule the next update
        timeoutHandle = setTimeout(updateFade, 20);
    };

    updateFade(); // Start the fading process

    // Return function to stop the animation
    return () => {
        clearTimeout(timeoutHandle);
    };
}
