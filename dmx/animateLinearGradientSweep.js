import { imgCol, imgRow } from "./imageRatio.js";

export function animateLinearGradientSweep(pixelatedCtx) {
    const canvasWidth = imgCol; // Canvas width, adjust as needed
    const visibleCanvasHeight = imgRow * 1; // Canvas height, adjust as needed
    const extendedCanvasHeight = visibleCanvasHeight * 2; // Extended height for longer transitions

    let gradientOffset = 0;  // Initialize gradient offset
    let direction = 1;  // Initialize direction (1 for down, -1 for up)
    let timeoutHandle = null; // Store the timeout handle to allow clearing
    let delayCounter = 0; // Counter to introduce delay at fully black/white states
    const delayFrames = 10; // Number of frames to delay

    // Define the update function that uses setTimeout for dynamic intervals
    const updateGradient = () => {
        // Create a linear gradient from top to bottom
        let gradient = pixelatedCtx.createLinearGradient(0, -extendedCanvasHeight / 2 + gradientOffset, 0, extendedCanvasHeight / 2 + gradientOffset);

        // Add color stops to create a sharp transition
        gradient.addColorStop(0, 'rgb(0, 0, 0)'); // Black at the start
        gradient.addColorStop(0.35, 'rgb(0, 0, 0)'); // Black close to the middle
        gradient.addColorStop(0.65, 'rgb(255, 255, 255)'); // White close to the middle
        gradient.addColorStop(1, 'rgb(255, 255, 255)'); // White at the end

        // Apply the gradient as fill style and fill the canvas
        pixelatedCtx.fillStyle = gradient;
        pixelatedCtx.fillRect(0, 0, canvasWidth, visibleCanvasHeight);

        // Update the gradient offset continuously
        if (delayCounter > 0) {
            delayCounter--;
        } else {
            gradientOffset += direction; // Update by a fixed small increment

            // Change direction if gradientOffset reaches the extended canvas height bounds
            if (gradientOffset >= extendedCanvasHeight / 1.8) {
                direction = -1;  // Reverse the direction
                delayCounter = delayFrames; // Introduce delay at fully white state
            } else if (gradientOffset <= -extendedCanvasHeight / 2) {
                direction = 1;  // Reverse the direction
                delayCounter = delayFrames; // Introduce delay at fully black state
            }
        }

        // Schedule the next update, using the value from the input field to determine the interval
        timeoutHandle = setTimeout(updateGradient, parseFloat(document.getElementById('animSpeed').value));
    };

    // Start the first update
    updateGradient();

    // Return a function to stop the animation
    return () => {
        clearTimeout(timeoutHandle);
    };
}
