let initialized = false;
let topCanvases;
let topCtxs;

function initializeContexts() {
    if (!initialized) {
        topCanvases = document.querySelectorAll('.video-container .top-canvas');
        topCtxs = [
            topCanvases[0].getContext('2d', { willReadFrequently: true }),
            topCanvases[1].getContext('2d', { willReadFrequently: true })
        ];
        initialized = true;
    }
}

export function drawFaces(canvas, ctx, person, video, i) {
    if (!initialized) {
        initializeContexts();
    }

    const topCtx = topCtxs[i];
    const topCanvas = topCanvases[i];

    drawBB(topCanvas, topCtx, person.pose);
    drawSkeleton(topCanvas, topCtx, person.pose);
}

function drawBB(canvas, ctx, person) {
    ctx.beginPath();
    const leftEar = person.keypoints[4];
    const rightEar = person.keypoints[3];
    const nose = person.keypoints[0];
    const faceWidth = Math.abs(leftEar.position.x - rightEar.position.x);
    const midPointY = nose.position.y;
    const topLeftX = Math.min(rightEar.position.x, leftEar.position.x);
    const topLeftY = midPointY - faceWidth / 2;
    ctx.strokeRect(topLeftX, topLeftY, faceWidth, faceWidth);
    ctx.stroke();
    ctx.closePath();
}

let keypoint_thres = 0.11;

function drawSkeleton(canvas, ctx, person) {
    ctx.beginPath();
    const leftShoulder = person.keypoints[5];
    const rightShoulder = person.keypoints[6];
    const leftElbow = person.keypoints[7];
    const rightElbow = person.keypoints[8];
    const leftWrist = person.keypoints[9];
    const rightWrist = person.keypoints[10];
    const leftHip = person.keypoints[11];
    const rightHip = person.keypoints[12];
    const leftKnee = person.keypoints[13];
    const rightKnee = person.keypoints[14];
    const leftAnkle = person.keypoints[15];
    const rightAnkle = person.keypoints[16];

    ctx.moveTo(leftShoulder.position.x, leftShoulder.position.y);

    if (rightShoulder.score > keypoint_thres) {
        ctx.lineTo(rightShoulder.position.x, rightShoulder.position.y);
        if (rightElbow.score > keypoint_thres) {
            ctx.lineTo(rightElbow.position.x, rightElbow.position.y);
            if (rightWrist.score > keypoint_thres) {
                ctx.lineTo(rightWrist.position.x, rightWrist.position.y);
            }
        }
    }

    ctx.moveTo(leftShoulder.position.x, leftShoulder.position.y);
    if (leftElbow.score > keypoint_thres) {
        ctx.lineTo(leftElbow.position.x, leftElbow.position.y);
        if (leftWrist.score > keypoint_thres) {
            ctx.lineTo(leftWrist.position.x, leftWrist.position.y);
        }
    }

    ctx.moveTo(leftShoulder.position.x, leftShoulder.position.y);
    if (leftHip.score > keypoint_thres) {
        ctx.lineTo(leftHip.position.x, leftHip.position.y);
        if (leftKnee.score > keypoint_thres) {
            ctx.lineTo(leftKnee.position.x, leftKnee.position.y);
            if (leftAnkle.score > keypoint_thres) {
                ctx.lineTo(leftAnkle.position.x, leftAnkle.position.y);
            }
        }
    }

    ctx.moveTo(rightShoulder.position.x, rightShoulder.position.y);
    if (rightHip.score > keypoint_thres) {
        ctx.lineTo(rightHip.position.x, rightHip.position.y);
        if (rightKnee.score > keypoint_thres) {
            ctx.lineTo(rightKnee.position.x, rightKnee.position.y);
            if (rightAnkle.score > keypoint_thres) {
                ctx.lineTo(rightAnkle.position.x, rightAnkle.position.y);
            }
        }
    }

    ctx.stroke();
    ctx.closePath();
}

export function clearCanvas(canvas) {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}
