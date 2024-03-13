import {computeROI} from "./drawROI.js";
import {isEyeDistanceAboveThreshold} from "./minEyeDist.js";


export function clearCanvas(canvas){
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

export function drawFaces(canvas, ctx, person, video, i) {
    if(!isEyeDistanceAboveThreshold(person)){
        console.log('clearing pixel canvas')
        clearPixelCanvas(canvas, i)
        return
    }
    computeROI(video, canvas, ctx, person, i)
    drawBB(person)
    
    function drawBB(person){
        ctx.beginPath();
        ctx.rect(person.boundingBox.originX, person.boundingBox.originY, person.boundingBox.width, person.boundingBox.height);
        ctx.stroke();
    }
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