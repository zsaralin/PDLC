import {drawOuterRoi} from "./outerRoi.js";
import {drawSegmentation} from "./drawSegmentation.js";
import {updatePixelatedCanvas} from "./pixelCanvasUtils.js";
import {imgRatio} from "../dmx/imageRatio.js";

let finalCanvas, finalCtx;
let adjustedCenterX = [], adjustedCenterY = [];
let overlayCanvases, overlayCtxs;
let roiX, roiY, roiXOffset0, roiYOffset0, roiXOffset1, roiYOffset1;
let gaussianBlur, bg;
let initialized = false;

function initializeVars() {
    if (!initialized) {
        finalCanvas = document.createElement('canvas');
        finalCanvas.width = 50;
        finalCanvas.height = finalCanvas.width * (1 / imgRatio);
        finalCtx = finalCanvas.getContext('2d', {willReadFrequently: true});

        adjustedCenterX = [0, 0]; // Initial positions, adjust as needed
        adjustedCenterY = [0, 0]; // Initial positions, adjust as needed

        overlayCanvases = document.querySelectorAll('.video-container .top-canvas');
        overlayCtxs = [
            overlayCanvases[0].getContext('2d', {willReadFrequently: true}),
            overlayCanvases[1].getContext('2d', {willReadFrequently: true})
        ];

        roiX = document.getElementById("roiX");
        roiY = document.getElementById("roiY");
        roiXOffset0 = document.getElementById("roiXOffset0");
        roiYOffset0 = document.getElementById("roiYOffset0");
        roiXOffset1 = document.getElementById("roiXOffset1");
        roiYOffset1 = document.getElementById("roiYOffset1");

        gaussianBlur = document.getElementById('gaussianBlur');
        bg = document.getElementById('bg');

        initialized = true;
    }
}

export async function processFrame(video, overlayCanvas, overlayCtx, person, i) {
    if (!initialized) {
        initializeVars();
    }
    if (!video || video.paused) return;

    overlayCtx.drawImage(video, 0, 0, overlayCanvas.width, overlayCanvas.height);

    if (person) {
        const roiW = overlayCanvas.width * parseFloat(roiX.value);
        const roiH = overlayCanvas.height * parseFloat(roiY.value);
        const canvasDimension = overlayCanvas.width;
        const offsetX = parseFloat(i === 0 ? roiXOffset0.value : roiXOffset1.value) * canvasDimension;
        const offsetY = parseFloat(i === 0 ? roiYOffset0.value : roiYOffset1.value) * canvasDimension;
        const centerX = (overlayCanvas.width - roiW) / 2 + offsetX;
        const centerY = overlayCanvas.height - roiH + offsetY; // Align ROI to the bottom

        const can = await drawSegmentation(overlayCanvas, overlayCtx, person, i);
        if (can) {
            finalCtx.drawImage(can, centerX, centerY, roiW, roiH, 0, 0, finalCanvas.width, finalCanvas.height);
            finalCtx.filter = `blur(${gaussianBlur.value}px)`;
            finalCtx.drawImage(can, centerX, centerY, roiW, roiH, 0, 0, finalCanvas.width, finalCanvas.height);
        }
        updatePixelatedCanvas(finalCanvas, finalCtx, 0);

        overlayCtx.beginPath();
        overlayCtx.strokeStyle = "blue";
        overlayCtx.rect(centerX, centerY, roiW, roiH);
        overlayCtx.stroke();
        overlayCtx.closePath();
    }
    drawOuterRoi(overlayCanvas);
}

export function drawBGOnFinalCanvas() {
    if (!initialized) {
        initializeVars();
    }
    finalCtx.fillStyle = bg.value < 0 ? `rgba(255, 255, 255, ${-bg.value})` : `rgba(0, 0, 0, ${bg.value})`;
    finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
}
