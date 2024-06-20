import {createBackgroundSegmenter} from "../faceDetection/backgroundSegmenter.js";
const bgSeg = document.getElementById('bgSeg')
const bg = document.getElementById('bg')
const fg = document.getElementById('fg')

import {angle} from "../UIElements/videoOrientation.js";
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
        internalResolution: 'high',
        maxDetections: 5,
        refineSteps: 10,
        segmentationThreshold: .7,
    });
}

export let segmentationBrightness = 128 ;
let isAnimating = false; // Flag to prevent multiple simultaneous animations

let currState = [false, false];
let transitionProgress = [0, 0]; // Track the transition progress for each index

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

        let foregroundColor;
        if (currState[i]) {
            // Calculate the current color based on transition progress
            const transitionStep = 0.05; // Adjust this value for faster/slower transitions
            const colorValue = Math.max(0, 255 - Math.floor(255 * transitionProgress[i]));

            foregroundColor = { r: colorValue, g: colorValue, b: colorValue, a: 255 };

            // Update transition progress
            transitionProgress[i] += transitionStep;
            if (transitionProgress[i] >= 1) {
                currState[i] = false;
                transitionProgress[i] = 0;
            }
        } else {
            foregroundColor = fg.value < 0
                ? { r: 255, g: 255, b: 255, a: Math.abs(fg.value * 255) }
                : { r: 0, g: 0, b: 0, a: fg.value * 255 };
        }

        const backgroundColor = { r: 0, g: 0, b: 0, a: 0 };
        const backgroundDarkeningMask = bodyPix.toMask(person, foregroundColor, backgroundColor);

        bodyPix.drawMask(offscreenCanvas, offscreenCanvas, backgroundDarkeningMask, 1, 0, false);

        let outputCanvas = document.createElement('canvas');
        outputCanvas.width = canvas.width;
        outputCanvas.height = canvas.height;
        const outputCtx = outputCanvas.getContext('2d');

        outputCtx.save();
        outputCtx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(outputCanvas, 0, 0, canvas.width, canvas.height);

        return outputCanvas;
    }
}

document.addEventListener('stateChange', (event) => {
    const { index, state } = event.detail;
    if (index === 0 && state === 'NOT_NULL') {
        console.log(`State changed from null to non-null for index ${index}`);
        currState[0] = true;
        transitionProgress[0] = 0; // Reset transition progress
    }
    if (index === 1 && state === 'NOT_NULL') {
        console.log(`State changed from null to non-null for index ${index}`);
        currState[1] = true;
        transitionProgress[1] = 0; // Reset transition progress
    }
});


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
