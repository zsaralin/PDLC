let initialized = false;
let gamma;

function initializeElements() {
    if (initialized) return;

    gamma = document.getElementById('gamma');

    initialized = true;
}

/**
 * Applies gamma correction to the grayscale of the given canvas based on the value from the gamma slider.
 * Gamma correction adjusts the brightness and contrast of the image by altering the grayscale values.
 * @param {HTMLCanvasElement} canvas - The canvas element to apply gamma correction to.
 */
export function gammaCorrection(canvas) {
    initializeElements();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        let average = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;

        // Apply gamma correction to the grayscale value
        average = Math.pow(average / 255, gamma.value) * 255;

        // Ensure the value is within the valid range
        average = Math.max(0, Math.min(255, average));

        imageData.data[i] = average;
        imageData.data[i + 1] = average;
        imageData.data[i + 2] = average;
    }
    ctx.putImageData(imageData, 0, 0);
}
