import {createBackgroundSegmenter} from "../faceDetection/backgroundSegmenter.js";
const bgSeg = document.getElementById('bgSeg')
const bg = document.getElementById('bg')
const fg = document.getElementById('fg')

import {angle, mirror} from "../UIElements/videoOrientation.js";
import {appVersion} from "../UIElements/appVersionHandler.js";
import {adjustSkeletonBrightness} from "../filters/skeletonBrightness.js";
import { largerCanvases } from "./drawROI.js";
import { applyFilters } from "../filters/applyFilters.js";

let bgSegmenters;
export async function initBgSegmenters() {
    bgSegmenters = await createBackgroundSegmenter()
}

export async function getSegmentation(canvas, i){
    if(!bgSegmenters) await initBgSegmenters()
    return bgSegmenters[i].segmentMultiPerson(canvas, {
        flipHorizontal: false,
        internalResolution: 'full',
        maxDetections: 5,
        refineSteps: 10,
        segmentationThreshold: .5,
        quantBytes: 4,
        outputStride: 32,
    });
}

export let segmentationBrightness = 128 ;
export async function drawSegmentation(canvas, ctx, person, i) {
    if (bgSeg.checked) {
        const radians = angle * Math.PI / 180;
        if (!person) return;

        let offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = canvas.width;
        offscreenCanvas.height = canvas.height;
        const offscreenCtx = offscreenCanvas.getContext('2d');

        adjustSkeletonBrightness();
        segmentationBrightness = calculateAverageBrightness(offscreenCtx, canvas.width, canvas.height);

        offscreenCtx.globalCompositeOperation = 'destination-in';
        const foregroundColor = fg.value < 0
            ? {r: 255, g: 255, b: 255, a: Math.abs(fg.value * 255)}
            : {r: 0, g: 0, b: 0, a: fg.value * 255};
        const backgroundColor = bg.value < 0
            ? {r: 255, g: 255, b: 255, a: Math.abs(bg.value * 255)}
            : {r: 0, g: 0, b: 0, a: bg.value * 255};
        const backgroundDarkeningMask = bodyPix.toMask(person, foregroundColor, backgroundColor);
        bodyPix.drawMask(offscreenCanvas, offscreenCanvas, backgroundDarkeningMask, 1, 0, false);

        let outputCanvas = document.createElement('canvas');
        outputCanvas.width = canvas.width;
        outputCanvas.height = canvas.height;
        const outputCtx = outputCanvas.getContext('2d');
        outputCtx.drawImage(canvas, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
        outputCtx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);

        ctx.drawImage(outputCanvas, 0, 0, canvas.width, canvas.height);

        return outputCanvas;
    }
}

function calculateAverageBrightness(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    let totalBrightness = 0;
    let count = 0;

    for (let i = 0; i < data.length; i += 4) {
        // Assuming the mask is grayscale, average RGB values (since R=G=B in grayscale)
        let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        totalBrightness += avg;
        count++;
    }

    return totalBrightness / count;
}
