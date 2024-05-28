import {createBackgroundSegmenter} from "../faceDetection/backgroundSegmenter.js";
const bgSeg = document.getElementById('bgSeg')
const bg = document.getElementById('bg')
import {angle, mirror} from "../UIElements/videoOrientation.js";
import {appVersion} from "../UIElements/appVersionHandler.js";
import {adjustSkeletonBrightness} from "../filters/skeletonBrightness.js";

let bgSegmenters;
export async function initBgSegmenters() {
    bgSegmenters = await createBackgroundSegmenter()

}

export let segmentationBrightness = 128 ;
export async function drawSegmentation(canvas, ctx, i) {
    if(bgSeg.checked) {
        const radians = angle * Math.PI / 180; // Convert to radians

        // const canvas = document.querySelector('.cropped-canvas');
        let person = await bgSegmenters[i].estimatePoses(canvas)
        if (!person || !person[0]) return
        person = person[0]

        let offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = canvas.width;
        offscreenCanvas.height = canvas.height;
        const offscreenCtx = offscreenCanvas.getContext('2d');
        // offscreenCtx.save();
        // offscreenCtx.translate(canvas.width / 2, canvas.height / 2);
        // offscreenCtx.rotate(radians);
        // offscreenCtx.translate(-canvas.width / 2, -canvas.height / 2);
        offscreenCtx.drawImage(canvas, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
        if(appVersion === 'skeleton' ) segmentationBrightness = calculateAverageBrightness(offscreenCtx, canvas.width, canvas.height);
        offscreenCtx.globalCompositeOperation = 'destination-in';
        offscreenCtx.drawImage(person.segmentation.mask.mask, 0, 0, canvas.width, canvas.height);

        if(appVersion === 'skeleton') adjustSkeletonBrightness(offscreenCanvas)
        ctx.fillStyle = bg.value < 0 ? `rgba(255, 255, 255, ${-bg.value})` : `rgba(0, 0, 0, ${bg.value})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);
    
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
