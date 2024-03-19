import {computeROI} from "./drawROI.js";
import {isEyeDistanceAboveThresholdFace, isEyeDistanceAboveThresholdBody} from "./minEyeDist.js";


export function clearCanvas(canvas){
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

export function drawFaces(canvas, ctx, person, video, i) {
    if(!isEyeDistanceAboveThresholdBody(person)){
        console.log('clearing pixel canvas')
        clearPixelCanvas(canvas, i)
        return
    }
    computeROI(video, canvas, ctx, person, i)
    drawBB(ctx, person)

}

function clearPixelCanvas(canvas, i) {
    let pixelCanvas = document.getElementsByClassName("pixel-canvas")[i];
    if (canvas) {
        let canvasCtx = canvas.getContext('2d');
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (pixelCanvas) {
        let pixelCanvasCtx = pixelCanvas.getContext('2d');
        pixelCanvasCtx.clearRect(0, 0, pixelCanvas.width, pixelCanvas.height);
    }
}

function drawBB(ctx, person){
    // ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();

    const leftEar = person.keypoints[3]
    const rightEar = person.keypoints[4]

    if (!leftEar || !rightEar) {
        console.log("Could not find both ears in keypoints.");
        return;
    }

    const faceWidth = Math.abs(leftEar.x - rightEar.x);
    const midPointY = (leftEar.y + rightEar.y) / 2;
    const topLeftX = rightEar.x;
    const topLeftY = midPointY - faceWidth / 2;
    ctx.strokeRect(topLeftX, topLeftY, faceWidth, faceWidth);
    ctx.closePath();

    // ctx.beginPath();
    // ctx.rect(person.boundingBox.originX, person.boundingBox.originY, person.boundingBox.width, person.boundingBox.height);
    // ctx.stroke();
}