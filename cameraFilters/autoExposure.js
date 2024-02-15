import {track} from "./exposure.js";
import {activeFace} from "../newFaces.js";

let autoInt;
let exposureCompensation = 0; // Initial exposure compensation value
export let auto = true;
// Get the grayscale values display element
const enhValues = document.getElementById('brightnessRange');
let minValue = 88;
let maxValue = 168;
const minExposureTime = 0; // Minimum exposure time in microseconds
const maxExposureTime = 1250; // Maximum exposure time in microseconds
const minExposureComp = 0;
const maxExposureComp = 255;

export async function toggleAutoEV() {
    auto = !auto
    const exposureMode = document.getElementById('exposureModeWrapper')
    exposureMode.style.display = auto ? 'none' : 'block'
    const expoComp = document.getElementById('exposureCompWrapper')
    const exposureModeSelect = document.getElementById('exposureModeSelect')
    let manual = (exposureModeSelect.value === 'manual');
    expoComp.style.display = manual ? 'block' : 'none'
    exposureModeSelect.dispatchEvent(new Event('change'));

    const brightnessRange = document.getElementById('brightnessRangeWrapper')
    brightnessRange.style.display = auto ? 'block' : 'none'

}

let count = 0;
export async function monitorBrightness(video, track) {
    const canvas = document.getElementById('gray-canvas');
    const ctx = canvas.getContext('2d', {willReadFrequently: true});
    const frameInterval = 50; // Interval between brightness checks in milliseconds
    let exposureCompensation = 128; // Starting point for exposure compensation, adjust as needed
    let exposureTime = 150; // Starting point for exposure time in microseconds, adjust as needed
    let increasingExposureComp = true; // Direction flag for exposure compensation
    let increasingExposureTime = true; // Direction flag for exposure time
    let makingImageBrighter = true; // Flag for direction of adjustment

    track.applyConstraints({exposureMode: 'manual'});

    const autoInt = setInterval(async () => {
        if (auto && !video.paused) {
            if (activeFace) {
                let step = 5;
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const brightness = calculateBrightness(imageData.data);
                // console.log('brightness ' + brightness + ' exposureCompensation ' + exposureCompensation)
                if (brightness < minValue && (exposureCompensation + step) < maxExposureComp) {
                    exposureCompensation += step; // Increase exposure compensation
                    await track.applyConstraints({exposureCompensation: exposureCompensation});
                    console.log('Exposure compensation increased to', exposureCompensation);
                } else if (brightness > maxValue && (exposureCompensation - step) > minExposureComp ) {
                    exposureCompensation -= step; // Decrease exposure compensation
                    await track.applyConstraints({exposureCompensation: exposureCompensation});
                    console.log('Exposure compensation decreased to', exposureCompensation);
                }

                // Additional check to adjust exposure time if brightness is not within desired range
                if ((brightness < minValue || brightness > maxValue) && (exposureTime > minExposureTime || exposureTime < maxExposureTime)) {
                    if (brightness < minValue) {
                        exposureTime = Math.min(exposureTime + 1, maxExposureTime);
                    } else if(brightness > maxValue) {
                        exposureTime = Math.max(exposureTime - 1, minExposureTime);
                    }
                    await track.applyConstraints({exposureTime: exposureTime});
                }
                count = 0;

            } else {
                if (count === 25) {
                    // count = 0;
                    exposureCompensation = 128;
                    let exposureTimeStep = 50
                    if (makingImageBrighter) {
                        if (exposureTime < maxExposureTime) {
                            exposureTime += exposureTimeStep; // Adjust step size as needed
                        }
                    } else {
                        if (exposureTime > minExposureTime) {
                            exposureTime -= exposureTimeStep;
                        }
                    }

                    // Apply constraints only if adjustments were made
                    await track.applyConstraints({
                        exposureTime: exposureTime,
                    });

                    console.log(`Adjusted: Exposure Time = ${exposureTime}`);

                    // Reverse direction based on exposureTime reaching its limits, not exposureCompensation
                    if (makingImageBrighter && exposureTime >= maxExposureTime) {
                        makingImageBrighter = false; // Start decreasing
                    } else if (!makingImageBrighter && exposureTime <= minExposureTime) {
                        makingImageBrighter = true; // Start increasing
                    }
                } else{
                    count++
                }
            }

        }
    }, frameInterval);
}

function calculateBrightness(imageData) {
    // Calculate luminance (brightness) of an RGB pixel
    let sum = 0;
    for (let i = 0; i < imageData.length; i += 4) {
        sum += 0.299 * imageData[i] + 0.587 * imageData[i + 1] + 0.114 * imageData[i + 2];
    }
    return sum / (imageData.length / 4);
}


const contrastEnhSlider = document.getElementById("brightnessRangeSlider");
// Initialize the range slider with two thumbs
const slider = noUiSlider.create(contrastEnhSlider, {
    start: [minValue, maxValue], // Initial values for the two thumbs (min and max)
    connect: true, // Display a connecting bar between the two thumbs
    step: 1, // Step size for the slider
    range: {
        'min': 0, // Minimum value
        'max': 255 // Maximum value
    }
});

// Add a 'slide' event listener to prevent thumbs from having the same value
contrastEnhSlider.noUiSlider.on('slide', function (values, handle) {
    // Convert slider values from string to number
    let val0 = Number(values[0]),
        val1 = Number(values[1]);

    // Check if the values are equal
    if (val0 === val1) {
        // If so, adjust the value of the thumb being moved to enforce a minimum difference
        if (handle === 0) { // If the first handle is moved
            // Prevent going below minimum
            contrastEnhSlider.noUiSlider.set([Math.max(val0 - 1, 0), null]);
        } else { // If the second handle is moved
            // Prevent going above maximum
            contrastEnhSlider.noUiSlider.set([null, Math.min(val1 + 1, 255)]);
        }
    }
});
// Update the grayscale values display when the slider changes
slider.on('update', function (values) {
    enhValues.textContent = values.join(' - ');
    let currentValues = slider.get();
    minValue = parseFloat(currentValues[0]);
    maxValue = parseFloat(currentValues[1]);

});