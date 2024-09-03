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
    const pushConstant = parseFloat(document.getElementById('pushFactor').value); // Constant to push further to the left
    const pushLeft = canvas.width / parseFloat(document.getElementById('pushLeft').value); // Start applying push factor
    const pushRight = canvas.width / parseFloat(document.getElementById('pushRight').value); // Full push factor at this point
    const armMultiple = parseFloat(document.getElementById('armMultiple').value);
    const fg = parseFloat(document.getElementById('fg').value); // Foreground value

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

    const foregroundColor = valueToColor(fg);

    const copyCanvas = document.createElement('canvas');
    copyCanvas.width = canvas.width;
    copyCanvas.height = canvas.height;
    const copyCtx = copyCanvas.getContext('2d');

    person.forEach(pose => {
        const nose = pose.keypoints.find(kp => kp.name === 'nose');
        const leftShoulder = pose.keypoints.find(kp => kp.name === 'left_shoulder');
        const rightShoulder = pose.keypoints.find(kp => kp.name === 'right_shoulder');
        const leftElbow = pose.keypoints.find(kp => kp.name === 'left_elbow');
        const leftWrist = pose.keypoints.find(kp => kp.name === 'left_wrist');
        const rightElbow = pose.keypoints.find(kp => kp.name === 'right_elbow');
        const rightWrist = pose.keypoints.find(kp => kp.name === 'right_wrist');

        if (nose && nose.score > 0.2 && leftShoulder && rightShoulder) {
            let adjustedXOffset = xOffset;

            // Gradually apply push factor
            if (nose.x < pushLeft) {
                const t = (pushLeft - nose.x) / (pushLeft - pushRight);
                const pushFactor = t * pushConstant * (canvas.width / nose.x);
                adjustedXOffset -= pushFactor;
            }

            // Calculate shoulder distance and adjust line width accordingly
            const shoulderDist = Math.abs(leftShoulder.x - rightShoulder.x);
            const maxLineWidth = 12;
            const minLineWidth = 2;
            const lineWidth = Math.max(minLineWidth, maxLineWidth * (shoulderDist / canvas.width));

            // Set stroke and fill styles based on foreground color
            copyCtx.strokeStyle = `rgba(${foregroundColor.r}, ${foregroundColor.g}, ${foregroundColor.b}, ${foregroundColor.a / 255})`;
            copyCtx.fillStyle = `rgba(${foregroundColor.r}, ${foregroundColor.g}, ${foregroundColor.b}, ${foregroundColor.a / 255})`;
            copyCtx.lineWidth = lineWidth;

            // Body line: Ensure it extends to the bottom of the canvas
            copyCtx.beginPath();
            const bodyX = nose.x + adjustedXOffset;  // Central body line X value
            copyCtx.moveTo(bodyX, nose.y + yOffset); // Apply adjusted X and Y offsets to the nose position
            copyCtx.lineTo(bodyX, canvas.height); // Extend the line to the bottom of the canvas
            copyCtx.stroke();

            // Face circle
            const faceRadius = shoulderDist / 8;
            copyCtx.beginPath();
            copyCtx.arc(bodyX, nose.y + yOffset, faceRadius, 0, 2 * Math.PI); // Apply adjusted X and Y offsets to the face position
            copyCtx.fill();
            copyCtx.stroke();

            // Draw arms
            const drawArm = (shoulderPoint, elbowPoint, wristPoint) => {
                const elbowVector = {
                    x: elbowPoint.x - shoulderPoint.x,
                    y: elbowPoint.y - shoulderPoint.y
                };

                const wristVector = {
                    x: wristPoint.x - elbowPoint.x,
                    y: wristPoint.y - elbowPoint.y
                };

                // Stretch vectors to make arms longer based on armMultiple
                const stretchedElbow = {
                    x: bodyX + armMultiple * elbowVector.x,
                    y: shoulderPoint.y + armMultiple * elbowVector.y + yOffset
                };

                const stretchedWrist = {
                    x: stretchedElbow.x + armMultiple * wristVector.x,
                    y: elbowPoint.y + armMultiple * wristVector.y + yOffset
                };

                // Draw arm with stretched lengths, starting from the body line
                copyCtx.beginPath();
                copyCtx.moveTo(bodyX, shoulderPoint.y + yOffset);
                copyCtx.lineTo(stretchedElbow.x, stretchedElbow.y);
                copyCtx.lineTo(stretchedWrist.x, stretchedWrist.y);
                copyCtx.stroke();
            };

            // Draw left arm
            if (leftElbow && leftWrist) {
                drawArm(leftShoulder, leftElbow, leftWrist);
            }

            // Draw right arm
            if (rightElbow && rightWrist) {
                drawArm(rightShoulder, rightElbow, rightWrist);
            }
        }
    });

    // Reset the transformation before applying the blur
    copyCtx.setTransform(1, 0, 0, 1, 0, 0);

    // Apply Gaussian blur to the whole canvas
    for (let i = 0; i < feather; i++) {
        copyCtx.filter = `blur(${10}px)`; // Apply Gaussian blur with the specified feather value
        copyCtx.drawImage(copyCanvas, 0, 0);
    }

    // Reset filter to remove blur effect
    copyCtx.filter = 'none';

    // Draw the final result onto the original canvas
    ctx.drawImage(copyCanvas, 0, 0);

    // Return the copyCanvas
    return copyCanvas;
}