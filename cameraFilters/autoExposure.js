import {activeFaces} from "../newFaces.js";
import { SERVER_URL } from '../config.js';

export let auto = true;
// Get the grayscale values display element
const enhValues = document.getElementById('brightnessRange');
const exposureMode = document.getElementById('exposureModeWrapper')
const exposureModeSelect = document.getElementById('exposureModeSelect')
const brightnessRange = document.getElementById('brightnessRangeWrapper')

let minValue = 140;
let maxValue = 150;
const minExposureTime = 50; // Minimum exposure time in microseconds
const maxExposureTime = 1250; // Maximum exposure time in microseconds

export async function toggleAutoEV() {
    auto = !auto
    exposureMode.style.display = auto ? 'none' : 'block'
    const expoComp = document.getElementById('exposureCompWrapper')
    expoComp.style.display = (exposureModeSelect.value === 'manual') ? 'block' : 'none'
    exposureModeSelect.dispatchEvent(new Event('change'));
    brightnessRange.style.display = auto ? 'block' : 'none'
}

export async function monitorBrightness(video, camIndex) {
    const frameInterval = 1000; // Interval between brightness checks in milliseconds
    let exposureTime = 400; // Starting point for exposure time in microseconds
    let step; let count; 

    // Apply initial manual exposure mode constraint
    await fetch(`${SERVER_URL}/set-camera-control`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            controlName: 'autoExposureMode',
            value: '1',
            camIndex: camIndex
        })
    })       

    // Periodically check video brightness and adjust camera settings
    setInterval(async () => {
        if(!auto || video.paused) return
        if (activeFaces) {
        count = 0; // Reset the counter after adjustments are made
        // console.log(activeFaces[camIndex])
        let currentBrightness = calculateBrightness(video, activeFaces[camIndex]);
        // console.log('are u checking? ' + currentBrightness)
        // Dynamically calculate step based on distance from optimal brightness range
        let distanceFromOptimal;
        if (currentBrightness < minValue) {
            distanceFromOptimal = minValue - currentBrightness;
        } else if (currentBrightness > maxValue) {
            distanceFromOptimal = currentBrightness - maxValue;
        } else {
            distanceFromOptimal = 0; // Already within optimal range
        }
        // console.log(distanceFromOptimal)
        // Calculate step: The further from optimal, the larger the step.
        // Adjust the multiplier as needed to fine-tune responsiveness.
        step = distanceFromOptimal*2;

        await adjustExposureTime(currentBrightness, step);
    }
        else{
            step = 200;
            await adjustExposureTimeNoFace(step);
        }
    }, frameInterval);

    // Function to adjust exposure time based on brightness and limits
    async function adjustExposureTime(brightness, step) {
        if (brightness < minValue && exposureTime + step <= maxExposureTime) {
            exposureTime = Math.min(exposureTime + step, maxExposureTime);
            setExposureTime()
        } else if (brightness > maxValue && exposureTime - step >= minExposureTime) {
            exposureTime = Math.max(exposureTime - step, minExposureTime);
            setExposureTime()

        }
    }

    async function adjustExposureTimeNoFace(step) {
        if (exposureTime < maxExposureTime) {
            exposureTime = Math.min(exposureTime + step, maxExposureTime);
            setExposureTime()
        } else if (exposureTime > minExposureTime) {
            exposureTime = Math.max(exposureTime - step, minExposureTime);
            setExposureTime()
        }
    }

    async function setExposureTime(){
        await fetch(`${SERVER_URL}/set-camera-control`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    controlName: 'absoluteExposureTime',
                    value: exposureTime,
                    camIndex: camIndex,
                })
            })      
    }
}
const videoCanvas = document.createElement('canvas');
const ctx = videoCanvas.getContext('2d');

// Append the canvas to the document body or a specific element
// document.body.appendChild(videoCanvas);

function calculateBrightness(video, person, sampleRate = 1) {
    if(person){
        videoCanvas.width = video.videoWidth; // Example width, should match your video's dimensions
        videoCanvas.height = video.videoHeight; // Example height, should match your video's dimensions

        // ctx.strokeStyle = 'red'
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        ctx.beginPath();

        const leftEar = person.keypoints[7]
        const rightEar = person.keypoints[8]
        const nose = person.keypoints[0]
        const faceWidth = Math.abs(leftEar.x - rightEar.x);
        const midPointY = nose.y
        const topLeftX = Math.min(rightEar.x, leftEar.x);
        const topLeftY = midPointY - faceWidth / 2;
    
        // ctx.strokeRect(topLeftX, topLeftY, faceWidth, faceWidth);
        // ctx.closePath();
    // Get the image data for the bounding box area
    if(videoCanvas.width === 0) return
    const imageData = ctx.getImageData(topLeftX, topLeftY, faceWidth, faceWidth).data;
    // Calculate luminance (brightness) of the pixels within the bounding box
    let sum = 0;
    let count = 0;

    for (let i = 0; i < imageData.length; i += 4 * sampleRate) {
        // Calculate the luminance according to the digital ITU BT.709 formula
        sum += 0.2126 * imageData[i] + 0.7152 * imageData[i + 1] + 0.0722 * imageData[i + 2];
        count++;
    }
    // Return the average brightness of the sampled pixels
    return sum / count;
}}

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