import OneEuroFilter from "./euroFilter.js";
const lag = document.getElementById('lag');
import {applyFilters} from "../filters/applyFilters.js";
import {imgRatio} from "../imageRatio.js";
import { bgSeg } from "./bgSeg.js";
const roi = document.getElementById("roi");
const roiXOffset = document.getElementById("roiXOffset");
const roiYOffset = document.getElementById("roiYOffset");

let currentCenterX = [roi.value / 2,roi.value / 2]; // Initialize with the center of the canvas
let currentCenterY = [roi.value / 2,roi.value / 2]
let previousCenterX = [roi.value / 2,roi.value / 2] // Initialize with the initial center X
let previousCenterY = [roi.value / 2,roi.value / 2] // Initialize with the initial center Y
let easingFactorX = 1; // Adjust this value for the desired smoothness on the X axis
let easingFactorY = 1; // Adjust this value for the desired smoothness on the Y axis

export let center = false;

export function toggleCenter() {
    center = !center;
}

const filterFreq = 60; // Frequency of incoming data, in Hz
const minCutoff = 1.0; // Minimum cutoff frequency
const beta = 0.01; // Beta parameter
const dCutoff = 1.0; // Derivative cutoff frequency

const filterX = 
[new OneEuroFilter(filterFreq, minCutoff, beta, dCutoff),new OneEuroFilter(filterFreq, minCutoff, beta, dCutoff)];
const filterY = 
[new OneEuroFilter(filterFreq, minCutoff, beta, dCutoff),new OneEuroFilter(filterFreq, minCutoff, beta, dCutoff)];
const filterZ = 
[new OneEuroFilter(filterFreq, 0.1, 0, dCutoff),new OneEuroFilter(filterFreq, 0.1, 0, dCutoff)]

const filterCanvases = [];
const filterCtxs = [];

// Create the canvases and their contexts, then store them in the arrays
for (let i = 0; i < 2; i++) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', {willReadFrequently: true});
    canvas.width = 50;
    canvas.height = canvas.width * (1/imgRatio)
    filterCanvases.push(canvas);
    filterCtxs.push(ctx);
}

export function computeROI(video, canvas, ctx, person, i) {
    ctx.beginPath();
    if (!filterCtxs[i]) return;
    const width = Math.abs(person.keypoints[3].x - person.keypoints[4].x);
    const height = width;
    const x = person.keypoints[0].x 
    const y = person.keypoints[0].y 

    const dimensions = {
        originX: x,
        originY: y,
        width: width,
        height: height // Assuming you want a square; adjust if needed
    };

    const centerX = x //- width ;
    const centerY = y //+ height/2;

    let timestamp2 = Date.now();
    let smoothedWidth = filterZ[i].filter(width, timestamp2);
    // filterCanvases[i].width = smoothedWidth * roi.value * imgRatio;
    // filterCanvases[i].height = smoothedWidth * roi.value
    let w = smoothedWidth * roi.value * imgRatio;
    let h = smoothedWidth * roi.value
    const leewayFactor = 1 - lag.value;
    const movementThreshold = 15; // Adjust this value based on your requirements

    if (center) {
        let timestamp = Date.now(); // You should get a more accurate timestamp for your application

        let deltaX = centerX - currentCenterX[i];
        let deltaY = centerY - currentCenterY[i];

        // Apply the One Euro Filter to deltaX and deltaY
        let smoothedDeltaX = filterX[i].filter(deltaX, timestamp);
        let smoothedDeltaY = filterY[i].filter(deltaY, timestamp);

        // if (Math.abs(smoothedDeltaX) > movementThreshold) {
            currentCenterX[i] += smoothedDeltaX * (1 - lag.value);
        // }
        // if (Math.abs(smoothedDeltaY) > movementThreshold) {
            currentCenterY[i] += smoothedDeltaY * (1 - lag.value);
        // }
        // Ensure centerX and centerY are within the canvas bounds
        let maxCenterX = canvas.width - w/ 2;
        let maxCenterY = canvas.height - h / 2;

        let adjustedCenterX = Math.min(maxCenterX, Math.max(w/ 2, currentCenterX[i] + parseInt(roiXOffset.value)));
        let adjustedCenterY = Math.min(maxCenterY, Math.max(h / 2, currentCenterY[i] + parseInt(roiYOffset.value)));
        let topLeftX = adjustedCenterX - w / 2;
        let topLeftY = adjustedCenterY - h / 2;

        drawROI(topLeftX, topLeftY, bgSeg? canvas : video, ctx, i, w, h);
        ctx.closePath()
    } else {
        // Gradually adjust the previous center position using easing factors and conditions
        previousCenterX[i] = adjustPosition(previousCenterX[i] , centerX, leewayFactor * width * roi.value , easingFactorX);
        previousCenterY[i] = adjustPosition(previousCenterY[i] , centerY, leewayFactor * width * roi.value, easingFactorY);

        // Calculate the position for drawing so that the face stays centered
        const drawX = previousCenterX[i] - w/ 2 //+ parseInt(roiXOffset.value); 
        const drawY = previousCenterY[i] - h/ 2 //+ parseInt(roiYOffset.value);

        // Ensure drawX and drawY are within the canvas bounds
        const maxX = canvas.width - w;
        const maxY = canvas.height - h;
  
        const adjustedDrawX = Math.max(0, Math.min(maxX, drawX+ parseInt(roiXOffset.value)));
        const adjustedDrawY = Math.max(0, Math.min(maxY, drawY+ parseInt(roiYOffset.value)));
        
        // Copy the contents inside the square to the temporary canvas
        drawROI(adjustedDrawX, adjustedDrawY, bgSeg? canvas : video, ctx, i, w, h);

        // set after so it starts centred
        easingFactorX = 0.01;
        easingFactorY = 0.01;
    }
    // ctx.closePath()
    applyFilters(filterCanvases[i], filterCtxs[i], person, i)
    ctx.strokeStyle = "white"
}

function adjustPosition(previousPosition, newPosition, threshold, easingFactor) {
    if (Math.abs(newPosition - previousPosition) > threshold) {
        return previousPosition + (newPosition - previousPosition) * easingFactor;
    }
    return previousPosition;
}

function drawROI(x, y, video, ctx,i , w , h) {
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

}
const classNames = ['pixel-canvas', 'gray-canvas', 'cropped-canvas'];
const dict = {};

classNames.forEach(className => {
    const elements = document.querySelectorAll(`.${className}`);
    if (elements.length) {
        dict[className] = Array.from(elements).map(el => el.getContext('2d', {willReadFrequently: 'true'}));
    }
});

export function updateCanvas(canvasId, croppedImageData, i) {
    const ctx = dict[canvasId][i];
    if (ctx) {
        const img = new Image();
        img.src = croppedImageData;
        img.onload = () => {
            let drawWidth = 100; // This could be dynamic based on the canvas size or image size
            let drawHeight = drawWidth / imgRatio;

            // Update canvas size to maintain aspect ratio if necessary
            ctx.canvas.width = drawWidth;
            ctx.canvas.height = drawHeight;

            ctx.drawImage(img, 0, 0, drawWidth, drawHeight);
        };
    }
}