let minValue = 0
let maxValue = 255;
let newMinValue = 0
let newMaxValue = 255

export function remapGrayscaleValues(canvas ) {
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

    // Calculate the scaling factor for linear mapping
    const scale = (maxValue - minValue) / (maxPixelValue - minPixelValue);

    // Apply linear mapping to adjust pixel values
    for (let i = 0; i < imageData.data.length; i += 4) {
        let average = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;

        // Linear mapping to preserve relative differences
        average = (average - minPixelValue) * scale + minValue;
        average = Math.max(0, Math.min(255, average));

        imageData.data[i] = average;
        imageData.data[i + 1] = average;
        imageData.data[i + 2] = average;
    }

    ctx.putImageData(imageData, 0, 0);
}

//
const grayscaleSlider = document.getElementById("grayscaleMapSlider");
// Initialize the range slider with two thumbs
const slider = noUiSlider.create(grayscaleSlider, {
    // start: [100, 165], // Initial values for the two thumbs (min and max)
    start: [50, 225], // Initial values for the two thumbs (min and max)
    connect: true, // Display a connecting bar between the two thumbs
    step: 1, // Step size for the slider
    range: {
        'min': 0, // Minimum value
        'max': 255 // Maximum value
    }
});

// Get the grayscale values display element
const grayscaleValues = document.getElementById('grayscaleMapValues');

// Update the grayscale values display when the slider changes
slider.on('update', function (values) {
    grayscaleValues.textContent = values.join(' - ');
    let currentValues = slider.get();
    minValue = parseFloat(currentValues[0]);
    maxValue = parseFloat(currentValues[1]);
});