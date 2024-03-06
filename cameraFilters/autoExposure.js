import {track} from "./exposure.js";
import {activeFace} from "../newFaces.js";

let autoInt;
let exposureCompensation = 0; // Initial exposure compensation value
export let auto = true;
// Get the grayscale values display element
const enhValues = document.getElementById('brightnessRange');
let minValue = 120;
let maxValue = 125;
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

let count = 5;
const countThreshold = 10; // Define a threshold for the count

export async function monitorBrightness(video, track) {
    const canvas = document.getElementById('gray-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const frameInterval = 1000; // Interval between brightness checks in milliseconds
    const step = 10; // Increment for adjusting exposure
    let exposureCompensation = 128; // Starting point for exposure compensation
    let exposureTime = 150; // Starting point for exposure time in microseconds
    const exposureTimeStep = 100; // Step size for adjusting exposure time
    let makingImageBrighter = true; // Direction flag for adjusting brightness

    // Define thresholds and limits
    // const minValue = 100, maxValue = 150;
    const maxExposureComp = 255, minExposureComp = 0;
    const maxExposureTime = 1000, minExposureTime = 100;

    // Apply initial manual exposure mode constraint
    await track.applyConstraints({ exposureMode: 'manual' });

    // Function to adjust exposure compensation based on brightness
    let exposureCompensationLimitHitCounter = 0;
    const exposureCompensationLimitHitThreshold = 3; // Set this to the desired threshold

    async function adjustExposureCompensation(brightness) {
        let adjustmentNeeded = false;

        // Assuming these variables are defined in your scope
        let exposureCompensation = track.getSettings().exposureCompensation || 0; // Current exposure compensation
        const minExposureComp = 0; // Minimum exposure compensation value
        const maxExposureComp = 255; // Maximum exposure compensation value

        if (brightness < minValue || brightness > maxValue) {
            let adjustmentFactor = brightness < minValue ? Math.abs(minValue - brightness)/5 : Math.abs(brightness - maxValue)/5;
            // console.log('adjustment ' + adjustmentFactor);

            let actualStep = adjustmentFactor; // Adjusted step based on the distance from target brightness

            if (brightness < minValue) {
                if ((exposureCompensation + actualStep) <= maxExposureComp) {
                    exposureCompensation += actualStep;
                    adjustmentNeeded = true;
                }
            } else if (brightness > maxValue) {
                if ((exposureCompensation - actualStep) >= minExposureComp) {
                    exposureCompensation -= actualStep;
                    adjustmentNeeded = true;
                }
            }

            if (adjustmentNeeded) {
                exposureCompensation = Math.max(minExposureComp, Math.min(exposureCompensation, maxExposureComp));
                await track.applyConstraints({ exposureCompensation });
                // console.log('Exposure compensation adjusted to', exposureCompensation);

                // Check if exposure compensation is at its limits
                if (exposureCompensation === minExposureComp || exposureCompensation === maxExposureComp) {
                    exposureCompensationLimitHitCounter++;
                    // If the limit has been hit consecutively, adjust exposure time
                    if (exposureCompensationLimitHitCounter >= exposureCompensationLimitHitThreshold) {
                        await adjustExposureTime(brightness); // Adjust this call to match your actual function's parameters
                        exposureCompensationLimitHitCounter = 0; // Reset counter after adjusting exposure time
                    }
                } else {
                    // Reset counter if the current adjustment does not hit the limits
                    exposureCompensationLimitHitCounter = 0;
                }
            }
        }
    }

    // Function to adjust exposure time based on brightness and limits
    async function adjustExposureTime(brightness) {
        if (brightness < minValue && exposureTime < maxExposureTime) {
            exposureTime += 2;
            await track.applyConstraints({ exposureTime });
            // console.log('Exposure time adjusted to', exposureTime);
        } else if (brightness > maxValue && exposureTime > minExposureTime) {
            exposureTime -= 2;
            await track.applyConstraints({ exposureTime });
            // console.log('Exposure time adjusted to', exposureTime);
        }
    }

    // Periodically check video brightness and adjust camera settings
    const autoInt = setInterval(async () => {
        if(!auto || video.paused) return
        if (activeFace) {
            count = 0; // Reset the counter after adjustments are made
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let brightness = calculateBrightness(imageData.data);
            await adjustExposureCompensation(brightness);
            // brightness = calculateBrightness(imageData.data);
            // Additional adjustment for exposure time if needed
            // if (brightness < minValue || brightness > maxValue) {
            //     await adjustExposureTime(brightness);
            // }
        } else {
            count++; // Increment count every time the else block is executed
            if (count >= countThreshold) {
                // Perform fallback adjustments only after several iterations without an active face
                let newExposureTime = makingImageBrighter ?
                    Math.min(exposureTime + exposureTimeStep, maxExposureTime) :
                    Math.max(exposureTime - exposureTimeStep, minExposureTime);

                if (newExposureTime !== exposureTime) {
                    exposureTime = newExposureTime;
                    await track.applyConstraints({ exposureTime });
                    // console.log(`Fallback adjusted: Exposure Time = ${exposureTime}`);
                }

                // Check if the exposure time has reached its limits and reverse direction if so
                if ((makingImageBrighter && exposureTime >= maxExposureTime) ||
                    (!makingImageBrighter && exposureTime <= minExposureTime)) {
                    makingImageBrighter = !makingImageBrighter; // Toggle the direction
                    // console.log("Toggling direction to make image", makingImageBrighter ? "brighter" : "darker");
                }
            }
        }
    }, frameInterval);
}

function calculateBrightness(imageData, sampleRate = 10) {
    // Calculate luminance (brightness) of an RGB pixel based on a sample
    let sum = 0;
    let count = 0; // Keep track of the number of pixels sampled

    // Only sample every 'sampleRate'th pixel to reduce computation
    for (let i = 0; i < imageData.length; i += 4 * sampleRate) {
        sum += 0.299 * imageData[i] + 0.587 * imageData[i + 1] + 0.114 * imageData[i + 2];
        count++;
    }

    return sum / count;
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