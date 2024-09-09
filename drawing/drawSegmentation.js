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
    const yOffset = i === 0 ? parseFloat(document.getElementById('segmentYOffset0').value) : parseFloat(document.getElementById('segmentYOffset1').value); // Get Y offset value
    let xOffset = i === 0 ? parseFloat(document.getElementById('roiXOffset0').value) : parseFloat(document.getElementById('roiXOffset1').value); // Get X offset value
    const feather = parseFloat(document.getElementById('segmentFeather').value) || 0; // Get feather value
    const pushConstant = i === 0 ? parseFloat(document.getElementById('pushFactor0').value) : parseFloat(document.getElementById('pushFactor1').value); // Constant to push further to the left
    const pushStart = canvas.width / 2; // Start applying push factor
    const pushEnd = canvas.width / 2.8; // Full push factor at this point
    const edgeAmplification = 25.0; // Amplification factor for movement beyond pushEnd
    const armMultiple = parseFloat(document.getElementById('armMultiple').value); // Arm length multiplier
    const legMultiple = armMultiple; // Leg length multiplier (use the same or adjust as needed)
    const armOffset = 0; // Offset to move arms down slightly below the head
    const legOffset = 30; // Offset to make legs connect properly
    const copyCanvas = document.createElement('canvas');
    copyCanvas.width = canvas.width;
    copyCanvas.height = canvas.height;
    const copyCtx = copyCanvas.getContext('2d');
    if (i === 0) {
        // Flip the canvas horizontally by scaling it by -1 on the x-axis
        copyCtx.save(); // Save the current context state
        copyCtx.scale(-1, 1); // Flip horizontally
        copyCtx.translate(-canvas.width, 0); // Adjust position to account for the flip
    }

    copyCtx.lineWidth = 9;

    person.forEach(pose => {
        const nose = pose.keypoints.find(kp => kp.name === 'nose');
        const leftHip = pose.keypoints.find(kp => kp.name === 'left_hip');
        const rightHip = pose.keypoints.find(kp => kp.name === 'right_hip');
        const leftShoulder = pose.keypoints.find(kp => kp.name === 'left_shoulder');
        const rightShoulder = pose.keypoints.find(kp => kp.name === 'right_shoulder');
        console.log(nose)
        if (nose && nose.score > 0.2 && leftHip && rightHip) {
            // 1. Calculate distance between shoulders and hips
            const shoulderDist = leftShoulder && rightShoulder ? Math.abs(leftShoulder.x - rightShoulder.x) : 0;

            // 2. Calculate the average hip position
            const avgHipY = (leftHip.y + rightHip.y) / 2;  // Midpoint between the hips

            let adjustedXOffset = xOffset;

            // 3. Calculate pushFactor logic
            let pushFactor = 1;
            if (i === 0) {
                if (nose.x > canvas.width / 2) {
                    const t = (pushStart - nose.x) / (pushStart - pushEnd);
                    pushFactor = t * 15 * (canvas.width / nose.x);
                } else if (nose.x < canvas.width * 2 / 3) {
                    const t = (pushStart - nose.x) / (pushStart - pushEnd);
                    pushFactor = t * 5 * (canvas.width / nose.x);
                } else {
                    const t = (pushStart - nose.x) / (pushStart - pushEnd);
                    pushFactor = t * 1 * (canvas.width / nose.x);
                }
            } else {
                if (nose.x < 130) {
                    const t = (pushStart - nose.x) / (pushStart - pushEnd);
                    pushFactor = t * (pushConstant + 1) * (canvas.width / nose.x);
                } else if (nose.x > 165) {
                    const t = (pushStart - nose.x) / (pushStart - pushEnd);
                    pushFactor = t * (pushConstant + 15) * (canvas.width / nose.x);
                } else if (nose.x > canvas.width / 2) {
                    const t = (pushStart - nose.x) / (pushStart - pushEnd);
                    pushFactor = t * (pushConstant + 0) * (canvas.width / nose.x);
                } else {
                    const t = (pushStart - nose.x) / (pushStart - pushEnd);
                    pushFactor = t * (pushConstant) * (canvas.width / nose.x);
                }
            }

            adjustedXOffset -= pushFactor;

            // Calculate bodyX
            const bodyX = nose.x + adjustedXOffset;

            // 4. Draw body line stopping at the hips
            copyCtx.beginPath();
            copyCtx.lineWidth = copyCtx.lineWidth * 2;
            copyCtx.moveTo(bodyX, nose.y + yOffset); // Start at the nose
            copyCtx.lineTo(bodyX, avgHipY + yOffset); // Stop at the average hip position
            copyCtx.strokeStyle = 'black';
            copyCtx.stroke();

            // Face circle
            const faceRadius = shoulderDist / 4;
            copyCtx.lineWidth = copyCtx.lineWidth / 2;
            copyCtx.beginPath();
            copyCtx.arc(bodyX, nose.y + yOffset, faceRadius, 0, 2 * Math.PI); // Apply adjusted X and Y offsets to the face position
            copyCtx.fillStyle = 'black';
            copyCtx.fill();
            copyCtx.stroke();

            // Draw arms only if score > 0.3
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
                        y: shoulder.y + armMultiple * elbowVector.y + yOffset + armOffset // Move arms down slightly below the head
                    };

                    const stretchedWrist = {
                        x: stretchedElbow.x + armMultiple * wristVector.x,
                        y: elbow.y + armMultiple * wristVector.y + yOffset + armOffset // Move arms down slightly below the head
                    };

                    // Draw arm with stretched lengths
                    copyCtx.beginPath();
                    copyCtx.moveTo(bodyX, shoulder.y + yOffset + armOffset); // Move arms down slightly below the head
                    copyCtx.lineTo(stretchedElbow.x, stretchedElbow.y);
                    copyCtx.lineTo(stretchedWrist.x, stretchedWrist.y);
                    copyCtx.stroke();
                }
            };

            // 5. Draw legs starting where the body ends (at the hips)

            // 5. Draw legs starting where the body ends (at the hips)
            const drawLeg = (hip, knee, ankle) => {
                if (hip.score > 0.5 && knee.score > 0.5 && ankle.score > 0.5) {
                    // Calculate the vector for knee relative to hip
                    const kneeVector = {
                        x: knee.x - hip.x,
                        y: knee.y - hip.y
                    };
            
                    // Calculate the stretched knee position, extending the leg beyond normal length
                    const stretchedKneeX = bodyX + legMultiple * 2 * kneeVector.x;
            
                    // Draw leg with stretched lengths starting from the hips
                    copyCtx.beginPath();
                    copyCtx.moveTo(bodyX, hip.y + yOffset); // Start at the hip
                    copyCtx.lineTo(stretchedKneeX, canvas.height + yOffset); // Extend the line to the bottom of the canvas
                    copyCtx.stroke();
                } else {
                    // If any keypoint score (hip, knee, or ankle) is < 0.3, draw a straight line from hip to bottom
                    copyCtx.lineWidth *= 2
                    copyCtx.beginPath();
                    copyCtx.moveTo(bodyX, hip.y + yOffset); // Start at the hip
                    copyCtx.lineTo(bodyX, 500); // Straight down to the bottom of the canvas
                    copyCtx.stroke();
                    copyCtx.lineWidth = copyCtx.lineWidth/2

                }
            };

            if (leftShoulder && leftHip) drawArm(leftShoulder, pose.keypoints.find(kp => kp.name === 'left_elbow'), pose.keypoints.find(kp => kp.name === 'left_wrist'));
            if (rightShoulder && rightHip) drawArm(rightShoulder, pose.keypoints.find(kp => kp.name === 'right_elbow'), pose.keypoints.find(kp => kp.name === 'right_wrist'));

            if (leftHip && pose.keypoints.find(kp => kp.name === 'left_knee')) drawLeg(leftHip, pose.keypoints.find(kp => kp.name === 'left_knee'), pose.keypoints.find(kp => kp.name === 'left_ankle'));
            if (rightHip && pose.keypoints.find(kp => kp.name === 'right_knee')) drawLeg(rightHip, pose.keypoints.find(kp => kp.name === 'right_knee'), pose.keypoints.find(kp => kp.name === 'right_ankle'));
        }
    });

    // Reset the transformation before applying the blur
    if (i === 0) {
        copyCtx.restore(); // Restore the original context (resetting the mirroring)
    }

    // Apply Gaussian blur to the whole canvas
    for (let i = 0; i < feather; i++) {
        copyCtx.filter = `blur(${20}px)`; // Apply Gaussian blur with the specified feather value
        copyCtx.drawImage(copyCanvas, 0, 0);
    }

    // Reset filter to remove blur effect
    copyCtx.filter = 'none';

    // Draw the final result onto the original canvas
    ctx.drawImage(copyCanvas, 0, 0);

    // Return the copyCanvas
    return copyCanvas;
}
