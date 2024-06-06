import {appVersion} from "../UIElements/appVersionHandler.js";


const topCanvases = document.querySelectorAll('.video-container .top-canvas');
const topCtxs = [topCanvases[0].getContext('2d', { willReadFrequently: true }), 
                topCanvases[1].getContext('2d', { willReadFrequently: true })]

export function drawFaces(canvas, ctx, person, video, i) {

    const topCtx = topCtxs[i];
    const topCanvas = topCanvases[i];

    drawBB(topCanvas, topCtx, person)
    drawSkeleton(topCanvas,topCtx,person)
}
function drawBB(canvas, ctx, person){
    const isSkeleton = appVersion.value === 'skeleton';
    ctx.beginPath();
    const leftEar = isSkeleton ? person.keypoints[8] : person.keypoints[4]
    const rightEar = isSkeleton ? person.keypoints[7] : person.keypoints[3]
    const nose = person.keypoints[0]
    const faceWidth = Math.abs(leftEar.x - rightEar.x);
    const midPointY = nose.y
    const topLeftX = Math.min(rightEar.x, leftEar.x);
    const topLeftY = midPointY - faceWidth / 2;
    ctx.strokeRect(topLeftX, topLeftY, faceWidth, faceWidth);
    ctx.stroke();

    ctx.closePath();
}

let keypoint_thres = .11

function drawSkeleton(canvas,ctx,person){
    const isSkeleton = appVersion.value === 'skeleton';

    ctx.beginPath();
    const leftShoulder = isSkeleton ? person.keypoints[12] : person.keypoints[5]
    const rightShoulder = isSkeleton ? person.keypoints[11] : person.keypoints[6]
    const leftElbow = isSkeleton ? person.keypoints[14] : person.keypoints[7]
    const rightElbow = isSkeleton ? person.keypoints[13] : person.keypoints[8]
    const leftWrist = isSkeleton ? person.keypoints[16] : person.keypoints[9]
    const rightWrist = isSkeleton ? person.keypoints[15] : person.keypoints[10]
    const leftHip = isSkeleton ? person.keypoints[24] : person.keypoints[11]
    const rightHip = isSkeleton ? person.keypoints[23] : person.keypoints[12]
    const leftKnee = isSkeleton ? person.keypoints[26] : person.keypoints[13]
    const rightKnee = isSkeleton ? person.keypoints[25] : person.keypoints[14]
    const leftAnkle = isSkeleton ? person.keypoints[28] : person.keypoints[15]
    const rightAnkle = isSkeleton ? person.keypoints[27] : person.keypoints[16]

    ctx.moveTo(leftShoulder.x, leftShoulder.y);

    if (rightShoulder.score > keypoint_thres) {
        ctx.lineTo(rightShoulder.x, rightShoulder.y);
        if (rightElbow.score > keypoint_thres) {
            ctx.lineTo(rightElbow.x, rightElbow.y);
            if (rightWrist.score > keypoint_thres) {
                ctx.lineTo(rightWrist.x, rightWrist.y);
            }
        }
    }

    ctx.moveTo(leftShoulder.x, leftShoulder.y);
    if (leftElbow.score > keypoint_thres) {
        ctx.lineTo(leftElbow.x, leftElbow.y);
        if (leftWrist.score > keypoint_thres) {
            ctx.lineTo(leftWrist.x, leftWrist.y);
        }
    }

    ctx.moveTo(leftShoulder.x, leftShoulder.y);
    if (leftHip.score > keypoint_thres) {
        ctx.lineTo(leftHip.x, leftHip.y);
        if (leftKnee.score > keypoint_thres) {
            ctx.lineTo(leftKnee.x, leftKnee.y);
            if (leftAnkle.score > keypoint_thres) {
                ctx.lineTo(leftAnkle.x, leftAnkle.y);
            }
        }
    }

    ctx.moveTo(rightShoulder.x, rightShoulder.y);
    if (rightHip.score > keypoint_thres) {
        ctx.lineTo(rightHip.x, rightHip.y);
        if (rightKnee.score > keypoint_thres) {
            ctx.lineTo(rightKnee.x, rightKnee.y);
            if (rightAnkle.score > keypoint_thres) {
                ctx.lineTo(rightAnkle.x, rightAnkle.y);
            }
        }
    }

    ctx.stroke();
    ctx.closePath();
}

export function clearCanvas(canvas){
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}