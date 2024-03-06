import OneEuroFilter from "./euroFilter.js";

const lag = document.getElementById('lag');
import {applyFilters} from "./filters/applyFilters.js";
import {imgRatio} from "./imageRatio.js";
import {bgSeg} from "./filters/bgSeg.js";

const roi = document.getElementById("roi");
const roiXOffset = document.getElementById("roiXOffset");
const roiYOffset = document.getElementById("roiYOffset");

let currentCenterX = roi.value / 2; // Initialize with the center of the canvas
let currentCenterY = roi.value / 2;
let currentCenterX0 = roi.value / 2; // Initialize with the center of the canvas
let currentCenterY0 = roi.value / 2;
let previousCenterX = roi.value / 2; // Initialize with the initial center X
let previousCenterY = roi.value / 2; // Initialize with the initial center Y

let easingFactorX = 1; // Adjust this value for the desired smoothness on the X axis
let easingFactorY = 1; // Adjust this value for the desired smoothness on the Y axis

export let center = true;

export function toggleCenter() {
    center = !center;
}

let ctx;
// let filterCanvas;
// let filterCtx;
const filterFreq = 60; // Frequency of incoming data, in Hz
const minCutoff = 1.0; // Minimum cutoff frequency
const beta = 0.01; // Beta parameter
const dCutoff = 1.0; // Derivative cutoff frequency

const filterX = new OneEuroFilter(filterFreq, minCutoff, beta, dCutoff);
const filterY = new OneEuroFilter(filterFreq, minCutoff, beta, dCutoff);
const filterZ = new OneEuroFilter(filterFreq, 0.1, 0, dCutoff);

const THRESHOLD = 50; // Define the threshold for width change
let previousWidth = 50;
let previousHeight = 50;
const filterCanvas = document.createElement('canvas');
const filterCtx = filterCanvas.getContext('2d', {willReadFrequently: true});
filterCanvas.width = 50;
filterCanvas.height = 50;
export function filteredCanvas(video, canvas, person) {
    ctx = canvas.getContext('2d', {willReadFrequently: true});
    ctx.beginPath();
    if (!filterCtx) return;
    const {originX: x, originY: y, width, height} = person.boundingBox;

    const centerX = x + width / 2;
    const centerY = y + height / 2;

    let timestamp2 = Date.now();
    let smoothedWidth = filterZ.filter(width, timestamp2);
    filterCanvas.width = smoothedWidth * roi.value* imgRatio;
    filterCanvas.height = smoothedWidth * roi.value
    previousWidth = width;

    const leewayFactor = 1 - lag.value;
    const movementThreshold = 15; // Adjust this value based on your requirements

    if (center) {
        ctx.beginPath();
        let timestamp = Date.now(); // You should get a more accurate timestamp for your application

        let deltaX = centerX - currentCenterX;
        let deltaY = centerY - currentCenterY;

        // Apply the One Euro Filter to deltaX and deltaY
        let smoothedDeltaX = filterX.filter(deltaX, timestamp);
        let smoothedDeltaY = filterY.filter(deltaY, timestamp);

        if (Math.abs(smoothedDeltaX) > movementThreshold) {
            currentCenterX += smoothedDeltaX * (1 - lag.value);
        }
        if (Math.abs(smoothedDeltaY) > movementThreshold) {
            currentCenterY += smoothedDeltaY * (1 - lag.value);
        }
        // Ensure centerX and centerY are within the canvas bounds
        let maxCenterX = canvas.width - filterCanvas.width / 2;
        let maxCenterY = canvas.height - filterCanvas.height / 2;

        let adjustedCenterX = Math.min(maxCenterX, Math.max(filterCanvas.width / 2, currentCenterX)) + parseInt(roiXOffset.value);
        let adjustedCenterY = Math.min(maxCenterY, Math.max(filterCanvas.height / 2, currentCenterY)) + parseInt(roiYOffset.value);

        let topLeftX = adjustedCenterX - filterCanvas.width / 2;
        let topLeftY = adjustedCenterY - filterCanvas.height / 2;

        ctx.beginPath();

        // Ensure centerX and centerY are within the canvas bounds
        ctx.strokeStyle = "blue"
        ctx.lineWidth = 3

        ctx.rect(
            adjustedCenterX - filterCanvas.width / 2, adjustedCenterY - filterCanvas.height / 2,
            filterCanvas.width,
            filterCanvas.height
        );

        drawAndRect(topLeftX, topLeftY, bgSeg ? canvas : video);

        ctx.stroke(); // Apply the stroke with the current style (blue)

    } else {
        // Gradually adjust the previous center position using easing factors and conditions
        previousCenterX = adjustPosition(previousCenterX, centerX, leewayFactor * roi.value / 3, easingFactorX);
        previousCenterY = adjustPosition(previousCenterY, centerY, leewayFactor * roi.value / 3, easingFactorY);

        // Calculate the position for drawing so that the face stays centered
        const drawX = previousCenterX - filterCanvas.width / 2;
        const drawY = previousCenterY - filterCanvas.height / 2;

        // Ensure drawX and drawY are within the canvas bounds
        const maxX = canvas.width - filterCanvas.width;
        const maxY = canvas.height - filterCanvas.height;
        const adjustedDrawX = Math.min(maxX, Math.max(0, drawX));
        const adjustedDrawY = Math.min(maxY, Math.max(0, drawY));

        // Copy the contents inside the square to the temporary canvas
        drawAndRect(adjustedDrawX, adjustedDrawY, video);
        ctx.stroke()

        easingFactorX = 0.1;
        easingFactorY = 0.1;
    }
    applyFilters(filterCanvas, filterCtx, person)
    ctx.strokeStyle = "white"

}

function adjustPosition(previousPosition, newPosition, threshold, easingFactor) {
    if (Math.abs(newPosition - previousPosition) > threshold) {
        return previousPosition + (newPosition - previousPosition) * easingFactor;
    }
    return previousPosition;
}

function drawAndRect(x, y, video) {
    filterCtx.drawImage(
        video,
        x,
        y,
        filterCanvas.width,
        filterCanvas.height,
        0,
        0,
        filterCanvas.width,
        filterCanvas.height
    );

    ctx.rect(
        x,
        y,
        filterCanvas.width,
        filterCanvas.height
    );
}
const dict = {
    'pixel-canvas': document.getElementById('pixel-canvas')?.getContext('2d'),
    'gray-canvas': document.getElementById('gray-canvas')?.getContext('2d'),
    'cropped-canvas': document.getElementById('cropped-canvas')?.getContext('2d')
}
export function updateCanvas(canvasId, croppedImageData) {
    const ctx = dict[canvasId];
    if (ctx) {
        const img = new Image();
        img.src = croppedImageData;
        img.onload = () => {
            // Calculate the aspect ratio for the canvas size
            const aspectRatio = imgRatio; // Adjust this ratio as needed

            // Determine the size to draw the image
            // Adjust these values to maintain the aspect ratio based on your requirements
            let drawWidth = 100; // This could be dynamic based on the canvas size or image size
            let drawHeight = drawWidth / aspectRatio;

            // Update canvas size to maintain aspect ratio if necessary
            ctx.canvas.width = drawWidth;
            ctx.canvas.height = drawHeight;

            ctx.drawImage(img, 0, 0, drawWidth, drawHeight);
        };
    }
}