import {createBackgroundSegmenter} from "../faceDetection/backgroundSegmenter.js";
const bgSeg = document.getElementById('bgSeg')
const bg = document.getElementById('bg')
import {angle, mirror} from "../UIElements/videoOrientation.js";

let bgSegmenters;
export async function initBgSegmenters() {
    bgSegmenters = await createBackgroundSegmenter()

}

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
        offscreenCtx.save();
        offscreenCtx.translate(canvas.width / 2, canvas.height / 2);
        offscreenCtx.rotate(radians);
        offscreenCtx.translate(-canvas.width / 2, -canvas.height / 2);
        offscreenCtx.drawImage(canvas, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
        offscreenCtx.restore();
        offscreenCtx.globalCompositeOperation = 'destination-in';
        offscreenCtx.drawImage(person.segmentation.mask.mask, 0, 0, canvas.width, canvas.height);

        ctx.fillStyle = bg.value < 0 ? `rgba(255, 255, 255, ${-bg.value})` : `rgba(0, 0, 0, ${bg.value})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);
    }
}
