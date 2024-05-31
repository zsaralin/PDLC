import {createBackgroundSegmenter} from "../faceDetection/backgroundSegmenter.js";
const bgSeg = document.getElementById('bgSeg')
const bg = document.getElementById('bg')
import {angle, mirror} from "../UIElements/videoOrientation.js";
import {appVersion} from "../UIElements/appVersionHandler.js";
import {adjustSkeletonBrightness} from "../filters/skeletonBrightness.js";
import { largerCanvases } from "./drawROI.js";
import { applyFilters } from "../filters/applyFilters.js";

let bgSegmenters;
export async function initBgSegmenters() {
    bgSegmenters = await createBackgroundSegmenter()

}

export let segmentationBrightness = 128 ;
export async function drawSegmentation(canvas, ctx, i) {
    if (bgSeg.checked) {
        const radians = angle * Math.PI / 180;

        let person = await bgSegmenters[i].estimatePoses(canvas);
        if (!person || !person[0]) return;
        person = person[0];

        // Create off-screen canvas for segmentation mask processing
        let offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = canvas.width;
        offscreenCanvas.height = canvas.height;
        const offscreenCtx = offscreenCanvas.getContext('2d');

        offscreenCtx.drawImage(canvas, 0, 0, offscreenCanvas.width, offscreenCanvas.height);

        // if (appVersion === 'skeleton') {
        //     segmentationBrightness = calculateAverageBrightness(offscreenCtx, canvas.width, canvas.height);
        // }
        // segmentationBrightness = calculateAverageBrightness(offscreenCtx, canvas.width, canvas.height);


        await applyFilters(offscreenCanvas, offscreenCtx, i);
        segmentationBrightness = calculateAverageBrightness(offscreenCanvas, offscreenCtx, canvas.width, canvas.height);

        adjustSkeletonBrightness(offscreenCanvas);


        // adjustSkeletonBrightness(offscreenCanvas);

        offscreenCtx.globalCompositeOperation = 'destination-in';
        offscreenCtx.drawImage(person.segmentation.mask.mask, 0, 0, canvas.width, canvas.height);

        // if (appVersion === 'skeleton') {
        // adjustSkeletonBrightness(offscreenCanvas);
        // }

        // Create a new canvas for the final output
        let outputCanvas = document.createElement('canvas');
        outputCanvas.width = canvas.width;
        outputCanvas.height = canvas.height;
        const outputCtx = outputCanvas.getContext('2d');

        outputCtx.fillStyle = bg.value < 0 ? `rgba(255, 255, 255, ${-bg.value})` : `rgba(0, 0, 0, ${bg.value})`;
        outputCtx.fillRect(0, 0, canvas.width, canvas.height);
        outputCtx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);
        // segmentationBrightness = calculateAverageBrightness(offscreenCtx, canvas.width, canvas.height);

        // Draw the final output on the original context
        // ctx.drawImage(outputCanvas, 0, 0, canvas.width, canvas.height);

        // Return the final output canvas
        return outputCanvas;
    }
}

function calculateAverageBrightness(canvas, ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    let totalLuminance = 0;
    // First, calculate the current average luminance
    for (let i = 0; i < data.length; i += 4) {
        const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        totalLuminance += luminance;
    }
    const averageLuminance = totalLuminance / (canvas.width * canvas.height * 0.299 + 0.587 + 0.114);
    return averageLuminance

    return totalBrightness / count;
}
