import OneEuroFilter from "./euroFilter.js";
const lag = document.getElementById('lag');
import { applyFilters } from "../filters/applyFilters.js";
import { imgRatio } from "../dmx/imageRatio.js";
import { rotateCanvas, mirror, angle } from "../UIElements/videoOrientation.js";
import { appVersion } from "../UIElements/appVersionHandler.js";
const roi = document.getElementById("roi");
const roiXOffset = document.getElementById("roiXOffset");
const roiYOffset = document.getElementById("roiYOffset");

let currentCenterX;
let currentCenterY;
let previousCenterX;
let previousCenterY;

const centeringLeeway = document.getElementById('centeringLeeway')
const centeringSpeed = document.getElementById('centeringSpeed')
const filterFreq = 60; // Frequency of incoming data, in Hz
const minCutoff = 1.0; // Minimum cutoff frequency
const beta = 0.01; // Beta parameter
const dCutoff = 1.0; // Derivative cutoff frequency

const filterX =
    [new OneEuroFilter(filterFreq, minCutoff, beta, dCutoff), new OneEuroFilter(filterFreq, minCutoff, beta, dCutoff)];
const filterY =
    [new OneEuroFilter(filterFreq, minCutoff, beta, dCutoff), new OneEuroFilter(filterFreq, minCutoff, beta, dCutoff)];
const filterZ =
    [new OneEuroFilter(filterFreq, 0.1, 0, dCutoff), new OneEuroFilter(filterFreq, 0.1, 0, dCutoff)]

const filterCanvases = [];
const filterCtxs = [];

// Create the canvases and their contexts, then store them in the arrays
for (let i = 0; i < 2; i++) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = 50;
    canvas.height = canvas.width * (1 / imgRatio)
    filterCanvases.push(canvas);
    filterCtxs.push(ctx);
}

let animating = false;

export function computeROI(video, canvas, ctx, person, i) {
    if (!currentCenterX || !currentCenterY || !previousCenterX || !previousCenterY) {
        currentCenterX = [roi.value / 2, roi.value / 2];
        currentCenterY = [roi.value / 2, roi.value / 2]
        previousCenterX = [roi.value / 2, roi.value / 2]
        previousCenterY = [roi.value / 2, roi.value / 2]
    }
    if (!filterCtxs[i]) return;
    const width = appVersion === 'face' ? Math.abs(person.keypoints[8].x - person.keypoints[7].x) : Math.abs(person.keypoints[29].y - person.keypoints[0].y);
    
    let x = person.keypoints[0].x
    const y = appVersion === 'face' ? person.keypoints[0].y: width/2
    const centerX = x
    const centerY = y

    let timestamp = Date.now()
    let smoothedWidth = filterZ[i].filter(width, timestamp);

    let w = smoothedWidth * roi.value * imgRatio; 
    let h =  smoothedWidth * roi.value;
    let canvasAspectRatio = canvas.width / canvas.height;

    let roiAspectRatio = w / h;

    w = (roiAspectRatio > canvasAspectRatio) ? 
    (w > canvas.width ? canvas.width : w) :
    (h > canvas.height ? canvas.height * imgRatio : w);
    h = (roiAspectRatio > canvasAspectRatio) ? w / imgRatio : h;

    w = (w > canvas.width) ? canvas.width : w;
    h = (h > canvas.height) ? canvas.height : h;

    if (w < canvas.width && roiAspectRatio > canvasAspectRatio) {
        h = w / imgRatio;
    }

    if (h < canvas.height && roiAspectRatio <= canvasAspectRatio) {
        w = h * imgRatio;
    }

    if (typeof prevCenterX === 'undefined') {
        var prevCenterX = []; 
    }

    if (prevCenterX[i] === undefined) {
        prevCenterX[i] = centerX;
    }
    
    let deltaXThreshold = centeringLeeway.value * width  

    if (!animating) {
        if ((Math.abs(currentCenterX[i] - prevCenterX[i] ) )  > deltaXThreshold) {
            animating = true;
            let deltaX = centerX - currentCenterX[i] + parseFloat(roiXOffset.value)*width;
            let newValue = currentCenterX[i]  + deltaX 

            const numSteps = (centeringSpeed.max+1-centeringSpeed.value); // Adjust as needed
            let step = 0;

            const increment = deltaX / numSteps;

            const intervalId = setInterval(() => {
                currentCenterX[i] += increment; // Update currentCenterX[i] by the increment
                step++;

                if (step >= numSteps) {
                    clearInterval(intervalId); // Clear the interval
                    currentCenterX[i] = newValue; // Set currentCenterX[i] to newValue
                    animating = false;
                }
            }, 30);
        }

        prevCenterX[i] = currentCenterX[i];
    }

    let adjustedCenterX = Math.min(canvas.width - w / 2, Math.max(w / 2, currentCenterX[i]));
    let adjustedCenterY = Math.min(canvas.height - h / 2, Math.max(h / 2, centerY+ parseFloat(roiYOffset.value)*width));

    let topLeftX = adjustedCenterX - w / 2;
    let topLeftY = adjustedCenterY - h / 2;
    if (mirror) {
        topLeftX = canvas.width - topLeftX - w;
        topLeftX = Math.max(0, Math.min(canvas.width - w, topLeftX));
    }
    drawROI(topLeftX, topLeftY, canvas, ctx, i, w, h);
    applyFilters(filterCanvases[i], filterCtxs[i], person, i)
}

function drawROI(x, y, video, ctx, i, w, h) {
    ctx.beginPath();
    filterCtxs[i].drawImage(
        video,
        x,
        y,
        w,
        h,
        0,
        0,
        filterCanvases[i].width,
        filterCanvases[i].height
    );
    ctx.strokeStyle = "blue"
    ctx.lineWidth = 3
    ctx.rect(
        x,
        y,
        w,
        h
    );
    ctx.stroke()
    ctx.closePath();
    ctx.strokeStyle = "white"
}

const classNames = ['pixel-canvas', 'gray-canvas', 'cropped-canvas'];
const dict = {};

classNames.forEach(className => {
    const elements = document.querySelectorAll(`.${className}`);
    if (elements.length) {
        dict[className] = Array.from(elements).map(el => el.getContext('2d', { willReadFrequently: 'true' }));
    }
});

export function updateCanvas(canvasId, croppedImageData, i) {
    const ctx = dict[canvasId][i];
    if (ctx) {
        const img = new Image();
        img.src = croppedImageData;
        img.onload = () => {
            let drawWidth = 100; 
            let drawHeight = drawWidth / imgRatio;

            ctx.canvas.width = drawWidth;
            ctx.canvas.height = drawHeight;

            ctx.drawImage(img, 0, 0, drawWidth, drawHeight);
        };
    }
}