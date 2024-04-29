import OneEuroFilter from "./euroFilter.js";

const lag = document.getElementById('lag');
import {applyFilters} from "../filters/applyFilters.js";
import {imgRatio} from "../dmx/imageRatio.js";
import {rotateCanvas, mirror, angle} from "../UIElements/videoOrientation.js";
import {appVersion} from "../UIElements/appVersionHandler.js";
import {createBackgroundSegmenter} from "../faceDetection/backgroundSegmenter.js";

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

let adjustedCenterX, adjustedCenterY;
let topLeftX = [null, null], topLeftY = [null, null];


let animating = false;


export function computeROI(video, canvas, ctx, person, i) {
    if (!adjustedCenterX || !adjustedCenterY) {
        adjustedCenterX = [roi.value / 2, roi.value / 2];
        adjustedCenterY = [roi.value / 2, roi.value / 2]
    }

    let timestamp = Date.now()

    const bbWidth = appVersion === 'face' ? Math.abs(person.keypoints[4].x - person.keypoints[3].x) : Math.abs(person.keypoints[29].y - person.keypoints[0].y);

    const currCenterX = person.keypoints[0].x
    const currCenterY = appVersion === 'face' ? person.keypoints[0].y : bbWidth / 2

    let smoothedWidth = filter[i].filter(bbWidth, timestamp);
    const {roiW, roiH} = calculateROIDimensions(canvas, smoothedWidth, roi.value, imgRatio);

    let deltaThreshold = centeringLeeway.value * bbWidth

    if (!animating && (Math.abs(currCenterX - adjustedCenterX[i]) > deltaThreshold || Math.abs(currCenterY - adjustedCenterY[i]) > deltaThreshold))  {
        animatePosition(i, bbWidth, currCenterX, currCenterY, true, roiW, roiH, canvas)
    } else if((Math.abs(currCenterX - adjustedCenterX[i]) > deltaThreshold || Math.abs(currCenterY - adjustedCenterY[i]) > deltaThreshold)){

    }
    setTopLeft(i, roiW, roiH, canvas);  // update every time to account for changes in roiW
    drawROI(topLeftX[i], topLeftY[i], canvas, ctx, i, roiW, roiH);
    applyFilters(filterCanvases[i], filterCtxs[i], person, i)

}

function setTopLeft(i, roiW, roiH, canvas){
    topLeftX[i] = adjustedCenterX[i] - roiW / 2;
    topLeftY[i] =  adjustedCenterY[i] - roiH / 2;
    if (mirror) {
        topLeftX[i] = canvas.width - (topLeftX[i] + roiW);  // Calculate mirrored position
    }
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

let currAnimInterval;
function animatePosition(i, bbWidth, centerX, centerY, roiW, roiH, canvas) {
    if (!animating) {
        animating = true;  // Set the global animation flag to true

        let offsetX = parseFloat(roiXOffset.value) * bbWidth;
        let offsetY = parseFloat(roiYOffset.value) * bbWidth;
        let deltaX = centerX - adjustedCenterX[i] + offsetX;
        let deltaY = centerY - adjustedCenterY[i] + offsetY;
        let newCenterX = adjustedCenterX[i] + deltaX;
        let newCenterY = adjustedCenterY[i] + deltaY;

        const numSteps = (centeringSpeed.max + 1 - centeringSpeed.value);
        let step = 0;
        const incrementX = deltaX / numSteps;
        const incrementY = deltaY / numSteps;

        function stepAnimation() {
            if (step < numSteps) {
                adjustedCenterX[i] += incrementX;
                adjustedCenterY[i] += incrementY;
                step++;
                requestAnimationFrame(stepAnimation);
            } else {
                adjustedCenterX[i] = newCenterX;
                adjustedCenterY[i] = newCenterY;
                animating = false;
            }
        }

        requestAnimationFrame(stepAnimation);
    }
}

async function drawROI(x, y, video, ctx, index, width, height) {
    ctx.beginPath();
    filterCtxs[index].drawImage(video, x, y, width, height, 0, 0, filterCanvases[index].width, filterCanvases[index].height);
    ctx.strokeStyle = "blue";
    ctx.rect(x, y, width, height);
    ctx.stroke();
    ctx.closePath();
    ctx.strokeStyle = "white";
}