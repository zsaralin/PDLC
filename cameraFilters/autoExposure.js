import {activeFaces} from "../faceDetection/processDetection.js";
import { SERVER_URL } from '../config.js';

// Get the grayscale values display element
const autoEV = document.getElementById('autoEV')
const exposureMode = document.getElementById('exposureModeWrapper')
const exposureModeSelect = document.getElementById('exposureModeSelect')
const expoComp = document.getElementById('exposureCompWrapper')
const brightnessRange = document.getElementById('brightnessRange')

let isAuto = autoEV.checked
exposureMode.style.display = isAuto ? 'none' : 'block';
expoComp.style.display = !isAuto && (this.value === 'manual') ? 'block' : 'none';
brightnessRange.style.display = isAuto ? 'block' : 'none';

const minExposureTime = 50; 
const maxExposureTime = 1250; 

autoEV.addEventListener('change', function() {
    const isAuto = this.checked; 
    exposureMode.style.display = isAuto ? 'none' : 'block';
    expoComp.style.display = !isAuto ? 'block' : 'none';
    brightnessRange.style.display = isAuto ? 'block' : 'none';
});

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

    setInterval(async () => {
        if (!autoEV.checked || video.paused) return;
    
        if (activeFaces) {
            count = 0;
            let currentBrightness = calculateBrightness(video, activeFaces[camIndex]);
            let distanceFromOptimal;
            // Get the low and high values using getAttribute
            const lowValue = parseInt(brightnessRange.getAttribute('lowValue'), 10);
            const highValue = parseInt(brightnessRange.getAttribute('highValue'), 10);
        
            if (currentBrightness < lowValue) {
                distanceFromOptimal = lowValue - currentBrightness;
            } else if (currentBrightness > highValue) {
                distanceFromOptimal = currentBrightness - highValue;
            } else {
                distanceFromOptimal = 0; // Already within optimal range
            }
            
            step = distanceFromOptimal * 2;
            await adjustExposureTime(currentBrightness, step);
        } else {
            step = 200;
            await adjustExposureTimeNoFace(step);
        }
    }, frameInterval);
    
    async function adjustExposureTime(brightness, step) {
        const lowValue = parseInt(brightnessRange.getAttribute('lowValue'), 10);
        const highValue = parseInt(brightnessRange.getAttribute('highValue'), 10);
    
        if (brightness < lowValue && exposureTime + step <= maxExposureTime) {
            exposureTime = Math.min(exposureTime + step, maxExposureTime);
            setExposureTime();
        } else if (brightness > highValue && exposureTime - step >= minExposureTime) {
            exposureTime = Math.max(exposureTime - step, minExposureTime);
            setExposureTime();
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


function calculateBrightness(video, person, sampleRate = 1) {
    if(person){
        videoCanvas.width = video.videoWidth; // Example width, should match your video's dimensions
        videoCanvas.height = video.videoHeight; // Example height, should match your video's dimensions

        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        ctx.beginPath();

        const leftEar = person.keypoints[7]
        const rightEar = person.keypoints[8]
        const nose = person.keypoints[0]
        const faceWidth = Math.abs(leftEar.x - rightEar.x);
        const midPointY = nose.y
        const topLeftX = Math.min(rightEar.x, leftEar.x);
        const topLeftY = midPointY - faceWidth / 2;
    
    if(videoCanvas.width === 0) return
    const imageData = ctx.getImageData(topLeftX, topLeftY, faceWidth, faceWidth).data;
    let sum = 0;
    let count = 0;

    for (let i = 0; i < imageData.length; i += 4 * sampleRate) {
        sum += 0.2126 * imageData[i] + 0.7152 * imageData[i + 1] + 0.0722 * imageData[i + 2];
        count++;
    }
    return sum / count;
}}

// const contrastEnhSlider = document.getElementById("brightnessRangeSlider");


// // Add a 'slide' event listener to prevent thumbs from having the same value
// contrastEnhSlider.noUiSlider.on('slide', function (values, handle) {
//     // Convert slider values from string to number
//     let val0 = Number(values[0]),
//         val1 = Number(values[1]);

//     // Check if the values are equal
//     if (val0 === val1) {
//         // If so, adjust the value of the thumb being moved to enforce a minimum difference
//         if (handle === 0) { // If the first handle is moved
//             // Prevent going below minimum
//             contrastEnhSlider.noUiSlider.set([Math.max(val0 - 1, 0), null]);
//         } else { // If the second handle is moved
//             // Prevent going above maximum
//             contrastEnhSlider.noUiSlider.set([null, Math.min(val1 + 1, 255)]);
//         }
//     }
// });
// // Update the grayscale values display when the slider changes
// slider.on('update', function (values) {
//     enhValues.textContent = values.join(' - ');
//     let currentValues = slider.get();
//     minValue = parseFloat(currentValues[0]);
//     maxValue = parseFloat(currentValues[1]);

// });