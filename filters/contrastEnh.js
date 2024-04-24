
const slider = document.getElementById('contrastEnh')
/**
 * Performs contrast enhancement on the given canvas using values from the contrast enhancement slider.
 * Contrast enhancement adjusts the range of grayscale values in the image to increase contrast.
 * @param {HTMLCanvasElement} canvas - The canvas element to apply contrast enhancement to.
 */
export function contrastEnhancement(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lowValue = parseInt(slider.getAttribute('lowValue'), 10);
    const highValue = parseInt(slider.getAttribute('highValue'), 10);
    const outputMin = 0;
    const outputMax = 255;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        let average = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;

        // Remap the average value from the old range (lowValue to highValue) to the new range (outputMin to outputMax)
        average = ((average - lowValue) / (highValue - lowValue)) * (outputMax - outputMin) + outputMin;

        // Clamp the value to ensure it stays within the range of valid grayscale values
        average = Math.max(outputMin, Math.min(outputMax, average));

        // Apply the new average to all color channels (grayscale)
        imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = average;
    }
    ctx.putImageData(imageData, 0, 0);
}