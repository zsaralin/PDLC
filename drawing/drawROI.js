import OneEuroFilter from "./euroFilter.js";

const lag = document.getElementById('lag');
import {applyFilters} from "../filters/applyFilters.js";
import {imgRatio} from "../dmx/imageRatio.js";
import {angle} from "../UIElements/videoOrientation.js";
import {appVersion} from "../UIElements/appVersionHandler.js";
import {createBackgroundSegmenter} from "../detection/backgroundSegmenter.js";
import {drawSegmentation} from "./drawSegmentation.js";
import {updatePixelatedCanvas} from "./pixelCanvasUtils.js";

const roiX = document.getElementById("roiX");
const roiY = document.getElementById("roiY");
const roiXOffset0 = document.getElementById("roiXOffset0");
const roiYOffset0 = document.getElementById("roiYOffset0");
const roiXOffset1 = document.getElementById("roiXOffset1");
const roiYOffset1 = document.getElementById("roiYOffset1");

const centeringLeeway = document.getElementById('centeringLeeway');
const centeringSpeed = document.getElementById('centeringSpeed');
const filterFreq = 30, minCutoff = .0001, beta = 0.01, dCutoff = 5;

const filter = [
    new OneEuroFilter(filterFreq, minCutoff, beta, dCutoff),
    new OneEuroFilter(filterFreq, minCutoff, beta, dCutoff)
];

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

let adjustedCenterX = [];
let adjustedCenterY = [];
const significantMovePercentage = 0.10; // 10% of the bounding box width

export function getFilterCtx() {
    return filterCtxs[0];
}

for (let i = 0; i < 2; i++) {
    adjustedCenterX[i] = 0; // Initial position, adjust as needed
    adjustedCenterY[i] = 0; // Initial position, adjust as needed
}


const gaussianBlur = document.getElementById('gaussianBlur');
const bg = document.getElementById('bg');

export async function computeROI(video, canvas, ctx, person, i) {
    let timestamp = Date.now();

    const roiW = canvas.width * parseFloat(roiX.value);
    const roiH = canvas.height * parseFloat(roiY.value);

    const can = await drawSegmentation(canvas, ctx, person, i);

    if (can) {
        const offsetX = parseFloat(i === 0 ? roiXOffset0.value : roiXOffset1.value ) * canvas.width;
        const offsetY = parseFloat(i === 0 ? roiYOffset0.value : roiYOffset1.value ) * canvas.height;
        const centerX = (canvas.width - roiW) / 2 + offsetX;
        const centerY = canvas.height - roiH + offsetY; // Align ROI to the bottom

        filterCtxs[0].drawImage(can, centerX, centerY, roiW, roiH, 0, 0, filterCanvases[0].width, filterCanvases[0].height);
        filterCtxs[0].filter = `blur(${gaussianBlur.value}px)`;
        filterCtxs[0].drawImage(can, centerX, centerY, roiW, roiH, 0, 0, filterCanvases[0].width, filterCanvases[0].height);

    }
    drawROI(canvas, ctx, i, roiW, roiH);

    updatePixelatedCanvas(filterCanvases[0], filterCtxs[0], 0);
}

export function clearFilterCnv() {
    filterCtxs[0].fillStyle = bg.value < 0 ? `rgba(255, 255, 255, ${-bg.value})` : `rgba(0, 0, 0, ${bg.value})`;
    filterCtxs[0].fillRect(0, 0, filterCanvases[0].width, filterCanvases[0].height);
}

const topCanvases = document.querySelectorAll('.video-container .top-canvas');
const topCtxs = [topCanvases[0].getContext('2d', { willReadFrequently: true }),
    topCanvases[1].getContext('2d', { willReadFrequently: true })];

async function drawROI(canvas, ctx, index, width, height) {
    const topCtx = topCtxs[index];
    const topCanvas = topCanvases[index];
    topCtx.clearRect(0, 0, topCanvas.width, topCanvas.height);

    const bbWidth = topCanvas.width;
    const offsetX = parseFloat(index === 0 ? roiXOffset0.value : roiXOffset1.value) * bbWidth;
    const offsetY = parseFloat(index === 0 ? roiYOffset0.value : roiYOffset1.value) * bbWidth;
    const centerX = (canvas.width - width) / 2 + offsetX;
    const centerY = canvas.height - height + offsetY; // Align ROI to the bottom

    topCtx.beginPath();
    topCtx.strokeStyle = "blue";
    topCtx.rect(centerX, centerY, width, height);
    topCtx.stroke();
    topCtx.closePath();
    topCtx.strokeStyle = "white";
}
