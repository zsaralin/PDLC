import { drawFaces } from "./drawFaces.js";
import { drawOuterRoi } from "./outerRoi.js";
import { rotateCanvas , angle, mirror} from "../UIElements/videoOrientation.js";
import { computeROI } from "./drawROI.js";
let imageSegmenters = [];
let canvases = [];
let ctxs = [];

const bgSegCheckbox = document.getElementById('bgSeg')
const bg = document.getElementById('bg')

export async function startBodySegmenter(video, canvasI, i) {
    canvases[i] = canvasI;
    ctxs[i] = canvases[i].getContext('2d', { willReadFrequently: true });
    imageSegmenters[i] = await createBodySegmenter(i)
}

export async function createBodySegmenter() {
    const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
    const segmenterConfig = {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation'
    };
    return await bodySegmentation.createSegmenter(model, segmenterConfig);
}

export async function predictWebcamB(video, i, canvas, ctx, person) {
    console.log(person)
    if (!video || video.paused || !imageSegmenters[i]) return
    callbackForVideo(person.segmentation, video, i, canvas, ctx, person)
}

let fadeFromBlack = false;
let currentAlpha = 1; // Start fully opaque
const fadeRate = 0.05; // Adjust this to control how fast the fade occurs

function callbackForVideo(segmentation, video, i, canvas, ctx, person) {
    const radians = angle * Math.PI / 180; // Convert to radians

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    if (mirror) ctx.scale(-1, 1); // This flips the context horizontally

    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    if (bgSegCheckbox.checked) {
        ctx.fillStyle = bg.value < 0 ? `rgba(255, 255, 255, ${-bg.value})` : `rgba(0, 0, 0, ${bg.value})`;
    } else {
        ctx.fillStyle = 'rgba(0,0,0,0)';
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = video.videoWidth;
    offscreenCanvas.height = video.videoHeight;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(canvas.width / 2, canvas.height / 2);
    offscreenCtx.rotate(radians);
    offscreenCtx.translate(-canvas.width / 2, -canvas.height / 2);
    offscreenCtx.drawImage(video, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
    offscreenCtx.restore();
    offscreenCtx.globalCompositeOperation = 'destination-in';
    offscreenCtx.drawImage(segmentation.mask.mask, 0, 0, video.videoWidth, video.videoHeight);

    // Fade from black iteratively based on the frame calls
    if (fadeFromBlack && currentAlpha > 0) {
        offscreenCtx.fillStyle = `rgba(0, 0, 0, ${1-currentAlpha})`;
        offscreenCtx.fillRect(0, 0, canvas.width, canvas.height);
        currentAlpha -= fadeRate;
        if (currentAlpha <= 0) {
            fadeFromBlack = false; // Stop fading once fully transparent
        }
    }

    ctx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    drawOuterRoi(canvas);
    computeROI(video, canvas, ctx, person, i);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    if (mirror) ctx.scale(-1, 1);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    drawFaces(canvas, ctx, person, video, i);
    ctx.restore();

}


export function fadeToFaceFromBlack(){
    fadeFromBlack = true
    currentAlpha = 1;
}
