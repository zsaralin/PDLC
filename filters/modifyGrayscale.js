let minValue = 0
let maxValue = 255;
let exponent = 1;
const RANGE = 50;

const grayExpo = document.getElementById("grayExpo");
const grayExpoValue = document.getElementById("grayExpoValue");
grayExpo.addEventListener("input", function() {
    grayExpoValue.textContent = this.value;
    exponent = this.value;
});
export function modifyGrayscale(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const minPixelValue = Math.max(minValue - RANGE, 0); // Calculate the minPixelValue
    const maxPixelValue = Math.min(maxValue + RANGE, 255); // Calculate the maxPixelValue

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < imageData.data.length; i += 4) {
        let average = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;

        if (exponent === 1) {
            if (average < minValue) {
                for (let j = 0; j < 3; j++) { // Loop for red, green, and blue channels
                    imageData.data[i + j] =  (average / minValue) * RANGE + (minPixelValue);
                }
            } else if (average > maxValue) {
                for (let j = 0; j < 3; j++) { // Loop for red, green, and blue channels
                    imageData.data[i + j] = (average / maxPixelValue) * RANGE + (maxValue)
                }
            }
        } else {
            // Apply exponential scaling when the exponent is not 1
            if (average < minValue) {
                // Exponential scaling within the range [minValuePixel, minValue]
                average = minPixelValue + Math.pow((average / minValue), exponent) * RANGE
            } else if (average > maxValue) {
                average = maxValue + Math.pow((average / maxPixelValue), exponent) * RANGE
            }

            // Apply the adjusted average to all color channels
            for (let j = 0; j < 3; j++) { // Loop for red, green, and blue channels
                imageData.data[i + j] = average;
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
}


//
const grayscaleSlider = document.getElementById("grayscaleExpoSlider");
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
const grayscaleValues = document.getElementById('grayscaleExpo');

// Update the grayscale values display when the slider changes
slider.on('update', function (values) {
    grayscaleValues.textContent = values.join(' - ');
    let currentValues = slider.get();
    minValue = parseFloat(currentValues[0]);
    maxValue = parseFloat(currentValues[1]);
});