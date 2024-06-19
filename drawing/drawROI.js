import OneEuroFilter from "./euroFilter.js";

const lag = document.getElementById('lag');
import {applyFilters} from "../filters/applyFilters.js";
import {imgRatio} from "../dmx/imageRatio.js";
import {mirror, angle} from "../UIElements/videoOrientation.js";
import {appVersion} from "../UIElements/appVersionHandler.js";
import {createBackgroundSegmenter} from "../faceDetection/backgroundSegmenter.js";
import { drawSegmentation } from "./drawSegmentation.js";
import { updatePixelatedCanvas } from "./pixelCanvasUtils.js";

const roi = document.getElementById("roi");
const roiXOffset = document.getElementById("roiXOffset");
const roiYOffset = document.getElementById("roiYOffset");
const centeringLeeway = document.getElementById('centeringLeeway')
const centeringSpeed = document.getElementById('centeringSpeed')
const filterFreq = 30, minCutoff = .0001, beta = 0.01, dCutoff = 5;


const filter =
    [new OneEuroFilter(filterFreq, minCutoff, beta, dCutoff), new OneEuroFilter(filterFreq,  minCutoff, beta, dCutoff)]

const filterCanvases = [], filterCtxs = [];
for (let i = 0; i < 2; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = canvas.width * (1 / imgRatio);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    filterCanvases.push(canvas);
    filterCtxs.push(ctx);
}

export const largerCanvases = [], largerCtxs = [];
for (let i = 0; i < 2; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = canvas.width * (1 / imgRatio);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    largerCanvases.push(canvas);
    largerCtxs.push(ctx);
}

let topLeftX = [null, null], topLeftY = [null, null];

let animating = [];  // Or use an object if index 'i' is non-sequential

let adjustedCenterX = [];
let adjustedCenterY = [];
let lastCenterX = [];
let lastCenterY = [];
let currentAnimationId = [];
const significantMovePercentage = 0.10; // 10% of the bounding box width

export function getFilterCtx(){
    return filterCtxs[0]
}
for (let i = 0; i < 2; i++) {
    animating[i] = false;
    adjustedCenterX[i] = 0; // Initial position, adjust as needed
    adjustedCenterY[i] = 0; // Initial position, adjust as needed
    lastCenterX[i] = 0; // Initial position, adjust as needed
    lastCenterY[i] = 0; // Initial position, adjust as needed
    currentAnimationId[i] = null;
}

let offsetChanged = false; 
export function setOffsetChanged(){
    offsetChanged = true; 
}
const gaussianBlur = document.getElementById('gaussianBlur')


const bg = document.getElementById('bg')
export async function computeROI(video, canvas, ctx, person, i) {
    let timestamp = Date.now();

    const bbWidth = person.pose.keypoints[16].score > .3 ? Math.abs(person.pose.keypoints[16].position.y - person.pose.keypoints[0].position.y) : Math.abs(canvas.height - person.pose.keypoints[0].position.y);

    const currCenterX = person.pose.keypoints[0].position.x;
    const currCenterY = person.pose.keypoints[0].position.y;

    let smoothedWidth = filter[i].filter(bbWidth, timestamp);
    const { roiW, roiH } = calculateROIDimensions(canvas, smoothedWidth, roi.value, imgRatio);

    let deltaThreshold = centeringLeeway.value * bbWidth;

    if (!animating[i] && ((Math.abs(currCenterX - adjustedCenterX[i]) > deltaThreshold || Math.abs(currCenterY - adjustedCenterY[i]) > deltaThreshold) || offsetChanged)) {
        offsetChanged = offsetChanged === true ? false : offsetChanged;
        animatePosition(i, bbWidth, currCenterX, currCenterY, roiW, roiH, canvas);
    }
    setTopLeft(i, roiW, roiH, canvas);  // update every time to account for changes in roiW

    const can = await drawSegmentation(canvas, ctx, person, i);

    if(can) {
        filterCtxs[0].drawImage(can, topLeftX[i], topLeftY[i], roiW, roiH, 0, 0, filterCanvases[0].width, filterCanvases[0].height);
    }
    drawROI(topLeftX[i], topLeftY[i], canvas, ctx, i, roiW, roiH);

    // applyFilters(filterCanvases[i], filterCtxs[i], i)
    // applyFilters(off, off.getContext('2d'), person, i)
    updatePixelatedCanvas(filterCanvases[0], filterCtxs[0], 0);
}

export function clearFilterCnv(){
    filterCtxs[0].fillStyle =  bg.value < 0 ? `rgba(255, 255, 255, ${-bg.value})` : `rgba(0, 0, 0, ${bg.value})`;
    filterCtxs[0].fillRect(0,0,filterCanvases[0].width, filterCanvases[0].height)
}
function setTopLeft(i, roiW, roiH, canvas){
    topLeftX[i] = adjustedCenterX[i] - roiW / 2;
    topLeftY[i] =  adjustedCenterY[i] - roiH / 2;
    const width = angle % 90 === 0 ? canvas.height: canvas.width;
    const height = angle % 90 === 0 ? canvas.width: canvas.height;

    // if (mirror) {
    //     topLeftX[i] = canvas.width - (topLeftX[i] + roiW);  // Calculate mirrored position
    // }
    topLeftX[i] = Math.max(0, Math.min(topLeftX[i], canvas.width - roiW));
    topLeftY[i] = Math.max(0, Math.min(topLeftY[i], canvas.height - roiH));
}

function calculateROIDimensions(canvas, smoothedWidth, roiValue, imgRatio) {
    let roiW = smoothedWidth * roiValue * imgRatio;
    let roiH = smoothedWidth * roiValue;

    // Adjust dimensions based on aspect ratio
    const canvasAspectRatio = canvas.width / canvas.height;
    let roiAspectRatio = roiW / roiH;

    if (roiAspectRatio > canvasAspectRatio) {
        roiW = Math.min(roiW, canvas.width);
        roiH = roiW / imgRatio;
    } else {
        roiH = Math.min(roiH, canvas.height);
        roiW = roiH * imgRatio;
    }

    return {roiW, roiH};
}

function animatePosition(i, bbWidth, centerX, centerY, roiW, roiH, canvas) {
    let offsetX = parseFloat(roiXOffset.value) * bbWidth;
    let offsetY = parseFloat(roiYOffset.value) * bbWidth;
    let deltaX = centerX - adjustedCenterX[i] + offsetX;
    let deltaY = centerY - adjustedCenterY[i] + offsetY;
    let newCenterX = adjustedCenterX[i] + deltaX;
    let newCenterY = adjustedCenterY[i] + deltaY;

    // Calculate the significant move threshold as a percentage of the bounding box width
    let significantMoveThreshold = bbWidth * significantMovePercentage;

    // Determine if a significant move has occurred
    if (animating && Math.abs(newCenterX - lastCenterX[i]) > significantMoveThreshold || Math.abs(newCenterY - lastCenterY[i]) > significantMoveThreshold){
        // Reset the animation if the target has moved significantly
        cancelAnimationFrame(currentAnimationId[i]); // Assuming currentAnimationId[i] is tracked
        animating = false; // Allow the animation to restart
    }

    if (!animating) {
        animating = true;  // Set the global animation flag to true
        const numSteps = (centeringSpeed.max + 1 - centeringSpeed.value);
        let step = 0;
        const incrementX = deltaX / numSteps;
        const incrementY = deltaY / numSteps;

        lastCenterX[i] = newCenterX; // Update last known target X position
        lastCenterY[i] = newCenterY; // Update last known target Y position

        function stepAnimation() {
            if (step < numSteps) {
                adjustedCenterX[i] += incrementX;
                adjustedCenterY[i] += incrementY;
                step++;
                currentAnimationId[i] = requestAnimationFrame(stepAnimation);
            } else {
                adjustedCenterX[i] = newCenterX;
                adjustedCenterY[i] = newCenterY;
                animating = false;
            }
        }

        currentAnimationId[i] = requestAnimationFrame(stepAnimation);
    }
}

const topCanvases = document.querySelectorAll('.video-container .top-canvas');
const topCtxs = [topCanvases[0].getContext('2d', { willReadFrequently: true }), 
                topCanvases[1].getContext('2d', { willReadFrequently: true })]


async function drawROI(x, y, canvas, ctx, index, width, height) {
    const topCtx = topCtxs[index];
    const topCanvas = topCanvases[index];
    // topCtx.clearRect(0, 0, topCanvas.width, topCanvas.height);

    topCtx.beginPath();
    topCtx.strokeStyle = "blue";
    topCtx.rect(x, y, width, height);
    topCtx.stroke();
    topCtx.closePath();
    topCtx.strokeStyle = "white";
}