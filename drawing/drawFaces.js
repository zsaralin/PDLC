import {computeROI} from "./drawROI.js";
import { angle, rotateCanvas } from "../UIElements/videoOrientation.js";

export function clearCanvas(canvas){
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

export function drawFaces(canvas, ctx, person, video, i) {
    drawBB(canvas, ctx, person)

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

function drawBB(canvas, ctx, person){
    ctx.beginPath();

    const leftEar = person.keypoints[7]
    const rightEar = person.keypoints[8]
    const nose = person.keypoints[0]
    const faceWidth = Math.abs(leftEar.x - rightEar.x);
    const midPointY = nose.y
    const topLeftX = Math.min(rightEar.x, leftEar.x);
    const topLeftY = midPointY - faceWidth / 2;

    ctx.strokeRect(topLeftX, topLeftY, faceWidth, faceWidth);
    ctx.closePath();
}