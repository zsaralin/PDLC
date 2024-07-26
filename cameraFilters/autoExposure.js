import { activeFaces } from "../detection/processDetection.js";
import { SERVER_URL } from '../config.js';

let autoEV, exposureMode, exposureModeSelect, expoComp, brightnessRange;

function initExposureControls() {
    autoEV = document.getElementById('autoEV');
    exposureMode = document.getElementById('exposureModeWrapper');
    exposureModeSelect = document.getElementById('exposureModeSelect');
    expoComp = document.getElementById('exposureCompWrapper');
    brightnessRange = document.getElementById('brightnessRange');

    let isAuto = autoEV.checked;
    exposureMode.style.display = isAuto ? 'none' : 'block';
    expoComp.style.display = !isAuto && (exposureModeSelect.value === 'manual') ? 'block' : 'none';
    brightnessRange.style.display = isAuto ? 'block' : 'none';

    autoEV.addEventListener('change', function() {
        const isAuto = this.checked;
        exposureMode.style.display = isAuto ? 'none' : 'block';
        expoComp.style.display = !isAuto ? 'block' : 'none';
        brightnessRange.style.display = isAuto ? 'block' : 'none';
    });

    document.addEventListener('DOMContentLoaded', () => {
        console.log(exposureModeSelect.value);
        expoComp.style.display = !isAuto && (exposureModeSelect.value === 'manual') ? 'block' : 'none';
    });
}

export async function monitorBrightness(video, camIndex) {
    const frameInterval = 1000; // Interval between brightness checks in milliseconds
    let exposureTime = 400; // Starting point for exposure time in microseconds
    let step, count;

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
const ctx = videoCanvas.getContext('2d',  { willReadFrequently: true });

function calculateBrightness(video, person, sampleRate = 1) {
    if(person){
        videoCanvas.width = video.videoWidth; // Example width, should match your video's dimensions
        videoCanvas.height = video.videoHeight; // Example height, should match your video's dimensions

        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        ctx.beginPath();

        const leftEar = person.keypoints[3]
        const rightEar = person.keypoints[4]
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

export function initializeBrightnessMonitor() {
    initExposureControls();
}
