let minValue = 0
let maxValue = 255;

export function grayscaleCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        let average = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
        if (average < minValue) average = minValue;
        if (average > maxValue) average = maxValue;
        average = Math.max(0, Math.min(255, average));

        imageData.data[i] = average;
        imageData.data[i + 1] = average;
        imageData.data[i + 2] = average;
    }
    ctx.putImageData(imageData, 0, 0);
}


const grayscaleSlider = document.getElementById("grayscaleSlider");
// Initialize the range slider with two thumbs
const slider = noUiSlider.create(grayscaleSlider, {
    start: [0, 255], // Initial values for the two thumbs (min and max)
    connect: true, // Display a connecting bar between the two thumbs
    step: 1, // Step size for the slider
    range: {
        'min': 0, // Minimum value
        'max': 255 // Maximum value
    }
});

// Get the grayscale values display element
const grayscaleValues = document.getElementById('grayscaleValues');

// Update the grayscale values display when the slider changes
slider.on('update', function (values) {
    grayscaleValues.textContent = values.join(' - ');
    let currentValues = slider.get();
    minValue = parseFloat(currentValues[0]);
    maxValue = parseFloat(currentValues[1]);
});