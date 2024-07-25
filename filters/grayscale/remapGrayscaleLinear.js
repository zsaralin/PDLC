let initialized = false;
let slider;

function initializeElements() {
    if (initialized) return;

    slider = document.getElementById('grayscaleMapSlider');

    initialized = true;
}

export function remapGrayscaleLinear(canvas) {
    initializeElements();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let minPixelValue = Infinity;
    let maxPixelValue = -Infinity;

    // Find the minimum and maximum pixel values in the image
    for (let i = 0; i < imageData.data.length; i += 4) {
        let average = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
        minPixelValue = Math.min(minPixelValue, average);
        maxPixelValue = Math.max(maxPixelValue, average);
    }

    // Get the slider's lowValue and highValue using getAttribute and parse them as integers
    const lowValue = parseInt(slider.getAttribute('lowValue'), 10);
    const highValue = parseInt(slider.getAttribute('highValue'), 10);

    // Calculate the scaling factor for linear mapping
    const scale = (highValue - lowValue) / (maxPixelValue - minPixelValue);

    // Apply linear mapping to adjust pixel values
    for (let i = 0; i < imageData.data.length; i += 4) {
        let average = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;

        // Linear mapping to preserve relative differences
        average = (average - minPixelValue) * scale + lowValue;
        average = Math.max(0, Math.min(255, average));

        imageData.data[i] = average;
        imageData.data[i + 1] = average;
        imageData.data[i + 2] = average;
    }

    ctx.putImageData(imageData, 0, 0);
}
