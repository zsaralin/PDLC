import { createBackgroundSegmenter } from "../detection/backgroundSegmenter.js";
import {model} from "../detection/backgroundSegmenter.js";
export let segmentationBrightness = 128;

let bgSegmenters;
export async function initBgSegmenters() {
    bgSegmenters = await createBackgroundSegmenter();
}

export async function getSegmentation(canvas, i) {
    if (!bgSegmenters) await initBgSegmenters();
    if(canvas) {
        if(model === 'BodyPix') {
            return bgSegmenters[i].segmentPeople(canvas, {
                flipHorizontal: false,
                internalResolution: 'full',
                segmentBodyParts: true,        // maxDetections: 5,
                segmentationThreshold: .2,
                multiSegmentation: true,
                numKeypointForMatching: 17,
            });
        }
        else if(model === 'MoveNet'){
            return bgSegmenters[i].estimatePoses(canvas);
        }
    }
}


export async function drawSegmentation(canvas, ctx, person, i) {
    if (model === 'BodyPix') {
        return drawBodyPixSegmentation(canvas, ctx,person)
    } else if (model === 'MoveNet') {
        return drawMoveNetSegmentation(canvas, ctx,person, i)
    }
}

export async function drawBodyPixSegmentation(canvas, ctx, person) {
    const fg = document.getElementById('fg');
    const stretchXElement = document.getElementById('stretchX');
    const stretchYElement = document.getElementById('stretchY');
    const stretchX = parseFloat(stretchXElement.value);
    const stretchY = parseFloat(stretchYElement.value);

    function valueToColor(value) {
        if (value <= -1) {
            return {r: 255, g: 255, b: 255, a: 255}; // Opaque white
        } else if (value >= 1) {
            return {r: 0, g: 0, b: 0, a: 255}; // Opaque black
        } else {
            const alpha = Math.abs(value) * 255;
            if (value > 0) {
                return {r: 0, g: 0, b: 0, a: alpha}; // Black with variable transparency
            } else {
                return {r: 255, g: 255, b: 255, a: alpha}; // White with variable transparency
            }
        }
    }

    const foregroundColor = valueToColor(fg.value);
    const backgroundColor = {r: 0, g: 0, b: 0, a: 0}; // Transparent background

    const mask = await bodySegmentation.toBinaryMask(person, foregroundColor, backgroundColor);
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.putImageData(new ImageData(new Uint8ClampedArray(mask.data), mask.width, mask.height), 0, 0);

    const stretchedWidth = canvas.width * stretchX;
    const stretchedHeight = canvas.height * stretchY;
    const copyCanvas = document.createElement('canvas');
    copyCanvas.width = canvas.width;
    copyCanvas.height = canvas.height;
    const copyCtx = copyCanvas.getContext('2d');

    const maskCenterX = (canvas.width - stretchedWidth) / 2;
    const maskCenterY = (canvas.height - stretchedHeight) / 2; // Apply the Y offset here
    copyCtx.drawImage(offscreenCanvas, 0, 0, mask.width, mask.height, maskCenterX, maskCenterY, stretchedWidth, stretchedHeight);

    ctx.globalAlpha = 0.8;
    ctx.drawImage(offscreenCanvas, 0, 0, mask.width, mask.height, maskCenterX, maskCenterY, stretchedWidth, stretchedHeight);
    ctx.globalAlpha = 1.0;

    return copyCanvas;
}

export async function drawMoveNetSegmentation(canvas, ctx, person, i) {
    const yOffset = i === 0
        ? parseFloat(document.getElementById('segmentYOffset0').value)
        : parseFloat(document.getElementById('segmentYOffset1').value); // Get Y offset value

    const xOffset = i === 0
        ? parseFloat(document.getElementById('roiXOffset0').value)
        : parseFloat(document.getElementById('roiXOffset1').value); // Get X offset value

    const feather = parseFloat(document.getElementById('segmentFeather').value) || 0; // Get feather value
    const armMultiple = parseFloat(document.getElementById('armMultiple').value); // Arm length multiplier
    const legMultiple = armMultiple; // Leg length multiplier
    const armOffset = 0; // Offset to move arms down slightly below the head
    const legOffset = 30; // Offset to make legs connect properly

    const copyCanvas = document.createElement('canvas');
    copyCanvas.width = canvas.width;
    copyCanvas.height = canvas.height;
    const copyCtx = copyCanvas.getContext('2d');

    if (i === 0) {
        // Flip the canvas horizontally
        copyCtx.save(); // Save the current context state
        copyCtx.scale(-1, 1); // Flip horizontally
        copyCtx.translate(-canvas.width, 0); // Adjust position after flip
    }

    copyCtx.lineWidth = 9;

    person.forEach(pose => {
        const nose = pose.keypoints.find(kp => kp.name === 'nose');
        const leftHip = pose.keypoints.find(kp => kp.name === 'left_hip');
        const rightHip = pose.keypoints.find(kp => kp.name === 'right_hip');
        const leftShoulder = pose.keypoints.find(kp => kp.name === 'left_shoulder');
        const rightShoulder = pose.keypoints.find(kp => kp.name === 'right_shoulder');

        if (nose && nose.score > 0.2 && leftHip && rightHip) {
            // 1. Calculate distance between shoulders
            const shoulderDist = leftShoulder && rightShoulder
                ? Math.abs(leftShoulder.x - rightShoulder.x)
                : 0;

            // 2. Calculate the average hip position
            const avgHipY = (leftHip.y + rightHip.y) / 2; // Midpoint between hips

            const adjustedXOffset = xOffset;

            // Calculate bodyX
            const bodyX = nose.x + adjustedXOffset;

            // 3. Draw body line from nose to hips
            copyCtx.beginPath();
            copyCtx.lineWidth = copyCtx.lineWidth * 2;
            copyCtx.moveTo(bodyX, nose.y + yOffset);
            copyCtx.lineTo(bodyX, avgHipY + yOffset);
            copyCtx.strokeStyle = 'black';
            copyCtx.stroke();

            // Draw face circle
            const faceRadius = shoulderDist / 4;
            copyCtx.lineWidth = copyCtx.lineWidth / 2;
            copyCtx.beginPath();
            copyCtx.arc(bodyX, nose.y + yOffset, faceRadius, 0, 2 * Math.PI);
            copyCtx.fillStyle = 'black';
            copyCtx.fill();
            copyCtx.stroke();

            // Function to draw arms
            const drawArm = (shoulder, elbow, wrist) => {
                if (shoulder.score > 0.3 && elbow.score > 0.3 && wrist.score > 0.3) {
                    const elbowVector = {
                        x: elbow.x - shoulder.x,
                        y: elbow.y - shoulder.y
                    };

                    const wristVector = {
                        x: wrist.x - elbow.x,
                        y: wrist.y - elbow.y
                    };

                    const stretchedElbow = {
                        x: bodyX + armMultiple * elbowVector.x,
                        y: shoulder.y + armMultiple * elbowVector.y + yOffset + armOffset
                    };

                    const stretchedWrist = {
                        x: stretchedElbow.x + armMultiple * wristVector.x,
                        y: elbow.y + armMultiple * wristVector.y + yOffset + armOffset
                    };

                    // Draw arm
                    copyCtx.beginPath();
                    copyCtx.moveTo(bodyX, shoulder.y + yOffset + armOffset);
                    copyCtx.lineTo(stretchedElbow.x, stretchedElbow.y);
                    copyCtx.lineTo(stretchedWrist.x, stretchedWrist.y);
                    copyCtx.stroke();
                }
            };

            // Function to draw legs
            const drawLeg = (hip, knee, ankle) => {
                if (hip.score > 0.5 && knee.score > 0.5 && ankle.score > 0.5) {
                    const kneeVector = {
                        x: knee.x - hip.x,
                        y: knee.y - hip.y
                    };

                    const stretchedKneeX = bodyX + legMultiple * 2 * kneeVector.x;

                    // Draw leg
                    copyCtx.beginPath();
                    copyCtx.moveTo(bodyX, hip.y + yOffset);
                    copyCtx.lineTo(stretchedKneeX, canvas.height + yOffset);
                    copyCtx.stroke();
                } else {
                    // Draw straight leg to bottom
                    copyCtx.lineWidth *= 2;
                    copyCtx.beginPath();
                    copyCtx.moveTo(bodyX, hip.y + yOffset);
                    copyCtx.lineTo(bodyX, 500);
                    copyCtx.stroke();
                    copyCtx.lineWidth = copyCtx.lineWidth / 2;
                }
            };

            // Draw arms and legs
            if (leftShoulder && leftHip) {
                drawArm(
                    leftShoulder,
                    pose.keypoints.find(kp => kp.name === 'left_elbow'),
                    pose.keypoints.find(kp => kp.name === 'left_wrist')
                );
            }
            if (rightShoulder && rightHip) {
                drawArm(
                    rightShoulder,
                    pose.keypoints.find(kp => kp.name === 'right_elbow'),
                    pose.keypoints.find(kp => kp.name === 'right_wrist')
                );
            }

            if (leftHip && pose.keypoints.find(kp => kp.name === 'left_knee')) {
                drawLeg(
                    leftHip,
                    pose.keypoints.find(kp => kp.name === 'left_knee'),
                    pose.keypoints.find(kp => kp.name === 'left_ankle')
                );
            }
            if (rightHip && pose.keypoints.find(kp => kp.name === 'right_knee')) {
                drawLeg(
                    rightHip,
                    pose.keypoints.find(kp => kp.name === 'right_knee'),
                    pose.keypoints.find(kp => kp.name === 'right_ankle')
                );
            }
        }
    });

    // Restore the context if flipped
    if (i === 0) {
        copyCtx.restore();
    }

    // Apply Gaussian blur
    for (let i = 0; i < feather; i++) {
        copyCtx.filter = `blur(${20}px)`;
        copyCtx.drawImage(copyCanvas, 0, 0);
    }

    // Reset filter
    copyCtx.filter = 'none';

    // Draw the result onto the original canvas
    ctx.drawImage(copyCanvas, 0, 0);

    // Return the copyCanvas
    return copyCanvas;
}
