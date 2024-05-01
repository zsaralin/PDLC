const brightness = document.getElementById('brightness');

/**
 * Applies brightness adjustment to the given canvas based on the value from the brightness slider.
 * Brightness adjustment adds a constant value to each pixel's RGB values to increase or decrease brightness.
 * @param {HTMLCanvasElement} canvas - The canvas element to apply brightness adjustment to.
 */
export function applyBrightness(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const b = parseInt(brightness.value, 10); // Get the brightness value from the slider
    for (let i = 0; i < data.length; i += 4) {
        // Adjust RGB values by adding the brightness value
        data[i] = Math.max(0, Math.min(255, data[i] + b));   // Red channel
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + b)); // Green channel
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + b)); // Blue channel
    }

    // Put the modified image data back on the canvas
    ctx.putImageData(imageData, 0, 0);
}