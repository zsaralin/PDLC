import { drawFaces } from "./drawFaces.js";
import { drawOuterRoi } from "./outerRoi.js";
import { rotateCanvas , angle, mirror} from "../UIElements/videoOrientation.js";
import { computeROI } from "./drawROI.js";
let imageSegmenters = [];
let canvases = [];
let ctxs = [];

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
        // or 'base/node_modules/@mediapipe/selfie_segmentation' in npm.
    };
    return await bodySegmentation.createSegmenter(model, segmenterConfig);
}

export async function predictWebcamB(video, i, canvas, ctx, person, bgSeg) {
    if (!video || video.paused) return;
    if (bgSeg) {
        if (imageSegmenters[i] === undefined) {
            return;
        }
        callbackForVideo(person.segmentation, video, i, canvas, ctx, person)
        // imageSegmenters[i].segmentPeople(video).then((result) => {
        //     callbackForVideo(result, video, i, canvas, ctx, person);
        // }).catch((error) => {
        //     console.error('Error during segmentation:', error);
        // });
    } else {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        drawOuterRoi(canvas)
        drawFaces(canvas, ctx, person, video, i)
    }
}

function callbackForVideo(segmentation, video, i, canvas, ctx, person) {
    const radians = angle * Math.PI / 180; // Convert to radians
    
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2);
    if(mirror)ctx.scale(-1, 1); // This flips the context horizontally
   
   
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = bg.value < 0 ? `rgba(255, 255, 255, ${-bg.value})` : `rgba(0, 0, 0, ${bg.value})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
   
    let offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = video.videoWidth;
    offscreenCanvas.height = video.videoHeight;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    
    offscreenCtx.save(); // Save the current state to restore later
   
    offscreenCtx.translate(canvas.width / 2, canvas.height / 2);
   
    offscreenCtx.rotate(radians);
   
    offscreenCtx.translate(-canvas.width / 2, -canvas.height / 2);
    // Draw the video on the offscreen canvas, which will now be flipped
    offscreenCtx.drawImage(video, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
    
    offscreenCtx.restore(); // Restore the context to its original state, if needed for further drawing
   
    offscreenCtx.globalCompositeOperation = 'destination-in';
   
    // Draw the segmentation mask onto the offscreen canvas
    offscreenCtx.drawImage(segmentation.mask.mask, 0, 0, video.videoWidth, video.videoHeight);
   
    ctx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);
    
    // drawFaces(canvas, ctx, person, video, i);

    ctx.restore()

    drawOuterRoi(canvas);
    // computeROI(video, canvas, ctx, person, i)
    // ctx.restore()
    // drawFaces(canvas, ctx, person, video, i);

    computeROI(video, canvas, ctx, person, i)
    // ctx.restore()
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2);
    if(mirror)ctx.scale(-1, 1); // This flips the context horizontally
   
   
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    drawFaces(canvas, ctx, person, video, i);
    ctx.restore()
    // computeROI(video, canvas, ctx, person, i)



}



//  if (mirror) {
//     offscreenCtx.translate(offscreenCanvas.width / 2, offscreenCanvas.height / 2);
//     offscreenCtx.scale(-1, 1); // This flips the context horizontally
//     offscreenCtx.translate(-offscreenCanvas.width / 2, -offscreenCanvas.height / 2);
// }

// // Rotate the context
// offscreenCtx.translate(offscreenCanvas.width / 2, offscreenCanvas.height / 2);
// offscreenCtx.rotate(radians);
// offscreenCtx.translate(-offscreenCanvas.width / 2, -offscreenCanvas.height / 2);
