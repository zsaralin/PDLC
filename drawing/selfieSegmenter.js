import { drawFaces } from "./drawFaces.js";
import { drawOuterRoi } from "./outerRoi.js";
let imageSegmenters = [];
let canvases = [];
let ctxs = [];

export async function startBodySegmenter(video, canvasI, i) {
    canvases[i] = canvasI;
    ctxs[i] = canvases[i].getContext('2d', {willReadFrequently: true});
    imageSegmenters[i] = await createBodySegmenter(i)
}

export async function createBodySegmenter(){
    const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
    const segmenterConfig = {
    runtime: 'mediapipe',
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation'
                    // or 'base/node_modules/@mediapipe/selfie_segmentation' in npm.
    };
    return await bodySegmentation.createSegmenter(model, segmenterConfig);
}

export async function predictWebcamB(video, i, canvas, ctx, person, bgSeg) {
    if (!video || video.paused) return;
    if(bgSeg){
    if (imageSegmenters[i] === undefined) {
        return;
    }
    imageSegmenters[i].segmentPeople(video).then((result) => {
        callbackForVideo(result, video, i, canvas, ctx, person);
    }).catch((error) => {
        console.error('Error during segmentation:', error);
    });} else{
        ctx.drawImage(video, 0,0, canvas.width, canvas.height)
        drawOuterRoi(canvas)
        drawFaces(canvas, ctx, person, video, i)
    }
}

const bg = document.getElementById('bg');

function callbackForVideo(segmentation, video, i,canvas, ctx, person ) {
    ctx.drawImage(video, 0,0, canvas.width, canvas.height)
    ctx.fillStyle = bg.value < 0 ? `rgba(255, 255, 255, ${-bg.value})` : `rgba(0, 0, 0, ${bg.value})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = video.videoWidth;
    offscreenCanvas.height = video.videoHeight;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.drawImage(video, 0, 0); // Draw the video frame
    offscreenCtx.globalCompositeOperation = 'destination-in';
    offscreenCtx.drawImage(segmentation[0].mask.mask, 0, 0, video.videoWidth, video.videoHeight);
    ctx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);
    drawOuterRoi(canvas)
    drawFaces(canvas, ctx, person, video, i)
}
