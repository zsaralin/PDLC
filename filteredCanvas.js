import OneEuroFilter from "./euroFilter.js";

const lag = document.getElementById('lag');
import {applyFilters} from "./filters/applyFilters.js";

const roi = document.getElementById("roi");

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
let filterCanvas;
let filterCtx;
const filterFreq = 60; // Frequency of incoming data, in Hz
const minCutoff = 1.0; // Minimum cutoff frequency
const beta = 0.01; // Beta parameter
const dCutoff = 1.0; // Derivative cutoff frequency

const filterX = new OneEuroFilter(filterFreq, minCutoff, beta, dCutoff);
const filterY = new OneEuroFilter(filterFreq, minCutoff, beta, dCutoff);

export function filteredCanvas(video, canvas, person) {
    ctx = canvas.getContext('2d', {willReadFrequently: true});
    // ctx.strokeStyle = "yellow"
    ctx.beginPath();
    filterCanvas = document.createElement('canvas');
    filterCtx = filterCanvas.getContext('2d', {willReadFrequently: true});
    if (!filterCtx) return;
    const {x, y, width, height} = person.detection.box;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    filterCanvas.width = roi.value;
    filterCanvas.height = roi.value;
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
        ctx.strokeStyle = "yellow"
        ctx.lineWidth = 3
        let maxCenterX = canvas.width - filterCanvas.width / 2;
        let maxCenterY = canvas.height - filterCanvas.height / 2;

        // Adjust centerX and centerY if they exceed the canvas bounds
        let adjustedCenterX = Math.min(maxCenterX, Math.max(filterCanvas.width / 2, currentCenterX));
        let adjustedCenterY = Math.min(maxCenterY, Math.max(filterCanvas.height / 2, currentCenterY));

        // Calculate the top-left corner from the adjusted center
        let topLeftX = adjustedCenterX - filterCanvas.width / 2;
        let topLeftY = adjustedCenterY - filterCanvas.height / 2;

        // Copy the contents inside the square to the temporary canvas
        drawAndRect(topLeftX, topLeftY, video);
        ctx.stroke(); // Apply the stroke with the current style (blue)

        deltaX = centerX - currentCenterX;
        deltaY = centerY - currentCenterY;

        if (Math.abs(deltaX) > movementThreshold) {
            currentCenterX += deltaX * (1 - lag.value);
        }

        if (Math.abs(deltaY) > movementThreshold) {
            currentCenterY += deltaY * (1 - lag.value);
        }
        // Ensure centerX and centerY are within the canvas bounds
        maxCenterX = canvas.width - filterCanvas.width / 2;
        maxCenterY = canvas.height - filterCanvas.height / 2;

        // Adjust centerX and centerY if they exceed the canvas bounds
        adjustedCenterX = Math.min(maxCenterX, Math.max(filterCanvas.width / 2, currentCenterX));
        adjustedCenterY = Math.min(maxCenterY, Math.max(filterCanvas.height / 2, currentCenterY));

        currentCenterX0 += (centerX - currentCenterX0) * leewayFactor;
        currentCenterY0 += (centerY - currentCenterY0) * leewayFactor;

        ctx.beginPath();

        // Ensure centerX and centerY are within the canvas bounds
        ctx.strokeStyle = "blue"
        ctx.lineWidth = 3

        ctx.rect(
            adjustedCenterX - filterCanvas.width / 2, adjustedCenterY - filterCanvas.height / 2,
            filterCanvas.width,
            filterCanvas.height
        );
        //
        // // Ensure centerX and centerY are within the canvas bounds
        // maxCenterX = canvas.width - filterCanvas.width / 2;
        // maxCenterY = canvas.height - filterCanvas.height / 2;
        //
        // // Adjust centerX and centerY if they exceed the canvas bounds
        // adjustedCenterX = Math.min(maxCenterX, Math.max(filterCanvas.width / 2, currentCenterX0));
        // adjustedCenterY = Math.min(maxCenterY, Math.max(filterCanvas.height / 2, currentCenterY0));
        //
        // // Copy the contents inside the square to the temporary canvas
        // ctx.rect(
        //     adjustedCenterX - filterCanvas.width / 2, adjustedCenterY - filterCanvas.height / 2,
        //     filterCanvas.width,
        //     filterCanvas.height
        // );
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
    // ctx.stroke()
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

export function updateCanvas(canvasId, croppedImageData) {
    const canvas = document.getElementById(canvasId);
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const img = new Image();
            img.src = croppedImageData;
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
        }
    }
}