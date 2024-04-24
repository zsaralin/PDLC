const RANGE = 50;

const grayExpo = document.getElementById("grayExpo");
const slider = document.getElementById('grayscaleExpoSlider');

export function adjustGrayscaleWithExpo(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retrieve lowValue and highValue using getAttribute and parse them as integers
    const sliderLowValue = parseInt(slider.getAttribute('lowValue'), 10);
    const sliderHighValue = parseInt(slider.getAttribute('highValue'), 10);

    const minPixelValue = Math.max(sliderLowValue - RANGE, 0); // Calculate the minPixelValue
    const maxPixelValue = Math.min(sliderHighValue + RANGE, 255); // Calculate the maxPixelValue

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < imageData.data.length; i += 4) {
        let average = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
        if (grayExpo.value === 1) { // Ensure comparison as string if necessary
            if (average < sliderLowValue) {
                for (let j = 0; j < 3; j++) { // Loop for red, green, and blue channels
                    imageData.data[i + j] = (average / sliderLowValue) * RANGE + minPixelValue;
                }
            } else if (average > sliderHighValue) {
                for (let j = 0; j < 3; j++) { // Loop for red, green, and blue channels
                    imageData.data[i + j] = (average / sliderHighValue) * RANGE + sliderHighValue;
                }
            }
        } else {
            if (average < sliderLowValue) {
                average = minPixelValue + Math.pow((average / sliderLowValue), grayExpo.value )* RANGE;
            } else if (average > sliderHighValue) {
                average = sliderHighValue + Math.pow((average / maxPixelValue), grayExpo.value) * RANGE;
            }

            // Apply the adjusted average to all color channels
            for (let j = 0; j < 3; j++) { // Loop for red, green, and blue channels
                imageData.data[i + j] = average;
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
}
