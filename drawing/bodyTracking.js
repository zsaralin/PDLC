import { drawFaces } from "./drawFaces.js";
import { angle, mirror0, mirror1} from "../UIElements/videoOrientation.js";
import { computeROI } from "./drawROI.js";
import {drawOuterRoi} from "./outerRoi.js";

export async function predictWebcamB(video, i, canvas, ctx, person) {
    if (!video || video.paused ) return
    callbackForVideo(video, i, canvas, ctx, person)
}

let fadeFromBlack = false;
let currentAlpha = 1; // Start fully opaque
const fadeRate = 0.05; // Adjust this to control how fast the fade occurs

function callbackForVideo(video, i, canvas, ctx, person) {
    
    const radians = angle * Math.PI / 180; // Convert to radians

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(radians);

    if (i === 0 && mirror0 || i ===1 && mirror1) {
            if (angle % 180 === 0) {
                ctx.scale(-1, 1)
            } else {
                ctx.scale(1, -1)
            }
    }
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    ctx.restore();
    drawOuterRoi(canvas);
    if(person) {
        computeROI(video, canvas, ctx, person, i);
        // ctx.save();
        // ctx.translate(canvas.width / 2, canvas.height / 2);
        // if (mirror) ctx.scale(-1, 1);
        // ctx.translate(-canvas.width / 2, -canvas.height / 2);
        drawFaces(canvas, ctx, person, video, i);
        // ctx.restore();
    }

}


export function fadeToFaceFromBlack(){
    fadeFromBlack = true
    currentAlpha = 1;
}
