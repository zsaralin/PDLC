
export function drawFaces(canvas, ctx, person, video, i) {
    drawBB(canvas, ctx, person)
    drawSkeleton(canvas,ctx,person)
}
function drawBB(canvas, ctx, person){
    ctx.beginPath();
    const leftEar = person.keypoints[4]
    const rightEar = person.keypoints[3]
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
    ctx.beginPath();
    ctx.moveTo(person.keypoints[5].x, person.keypoints[5].y);

    if (person.keypoints[6].score > keypoint_thres) {
        ctx.lineTo(person.keypoints[6].x, person.keypoints[6].y);
        if (person.keypoints[8].score > keypoint_thres) {
            ctx.lineTo(person.keypoints[8].x, person.keypoints[8].y);
            if (person.keypoints[10].score > keypoint_thres) {
                ctx.lineTo(person.keypoints[10].x, person.keypoints[10].y);
            }
        }
    }

    ctx.moveTo(person.keypoints[5].x, person.keypoints[5].y);
    if (person.keypoints[7].score > keypoint_thres) {
        ctx.lineTo(person.keypoints[7].x, person.keypoints[7].y);
        if (person.keypoints[9].score > keypoint_thres) {
            ctx.lineTo(person.keypoints[9].x, person.keypoints[9].y);
        }
    }

    ctx.moveTo(person.keypoints[5].x, person.keypoints[5].y);
    if (person.keypoints[11].score > keypoint_thres) {
        ctx.lineTo(person.keypoints[11].x, person.keypoints[11].y);
        if (person.keypoints[13].score > keypoint_thres) {
            ctx.lineTo(person.keypoints[13].x, person.keypoints[13].y);
            if (person.keypoints[15].score > keypoint_thres) {
                ctx.lineTo(person.keypoints[15].x, person.keypoints[15].y);
            }
        }
    }

    ctx.moveTo(person.keypoints[6].x, person.keypoints[6].y);
    if (person.keypoints[12].score > keypoint_thres) {
        ctx.lineTo(person.keypoints[12].x, person.keypoints[12].y);
        if (person.keypoints[14].score > keypoint_thres) {
            ctx.lineTo(person.keypoints[14].x, person.keypoints[14].y);
            if (person.keypoints[16].score > keypoint_thres) {
                ctx.lineTo(person.keypoints[16].x, person.keypoints[16].y);
            }
        }
    }
    // ctx.moveTo(person.keypoints[12].x, person.keypoints[12].y);
    // ctx.lineTo(person.keypoints[14].x, person.keypoints[14].y);
    // ctx.lineTo(person.keypoints[16].x, person.keypoints[16].y);
    // ctx.lineTo(person.keypoints[18].x, person.keypoints[18].y);
    //
    // ctx.moveTo(person.keypoints[11].x, person.keypoints[11].y);
    // ctx.lineTo(person.keypoints[23].x, person.keypoints[23].y);
    //
    // ctx.moveTo(person.keypoints[24].x, person.keypoints[24].y);
    // ctx.lineTo(person.keypoints[26].x, person.keypoints[26].y);
    // ctx.lineTo(person.keypoints[28].x, person.keypoints[28].y);
    // ctx.lineTo(person.keypoints[32].x, person.keypoints[32].y);
    //
    // ctx.moveTo(person.keypoints[23].x, person.keypoints[23].y);
    // ctx.lineTo(person.keypoints[25].x, person.keypoints[25].y);
    // ctx.lineTo(person.keypoints[27].x, person.keypoints[27].y);
    // ctx.lineTo(person.keypoints[31].x, person.keypoints[31].y);

    ctx.stroke();
    ctx.closePath();
}

export function clearCanvas(canvas){
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}