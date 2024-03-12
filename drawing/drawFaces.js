import {computeROI} from "./drawROI.js";
import {isEyeDistanceAboveThreshold} from "./minEyeDist.js";


export function clearCanvas(canvas){
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

export function drawFaces(canvas, ctx, person, video, i) {
    if(!isEyeDistanceAboveThreshold(person)){
        console.log('clearing pixel canvas')
        clearPixelCanvas()
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

function clearPixelCanvas() {
    let canvas = document.getElementById('canvas');
    let pixelCanvas = document.getElementById("pixel-canvas");

    // Check if each canvas element is defined before attempting to clear it
    if (canvas) {
        let canvasCtx = canvas.getContext('2d');
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (pixelCanvas) {
        let pixelCanvasCtx = pixelCanvas.getContext('2d');
        pixelCanvasCtx.clearRect(0, 0, pixelCanvas.width, pixelCanvas.height);
    }
}