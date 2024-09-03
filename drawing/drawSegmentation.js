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
    const yOffset = parseFloat(document.getElementById('segmentYOffset').value) || 0; // Get Y offset value
    let xOffset = i === 0 ? parseFloat(document.getElementById('roiXOffset0').value) : parseFloat(document.getElementById('roiXOffset1').value); // Get X offset value
    const feather = parseFloat(document.getElementById('segmentFeather').value) || 0; // Get feather value
    const pushConstant = 8; // Constant to push further to the left
    const pushStart = canvas.width / 2; // Start applying push factor
    const pushEnd = canvas.width / 2.8; // Full push factor at this point
    const copyCanvas = document.createElement('canvas');
    copyCanvas.width = canvas.width;
    copyCanvas.height = canvas.height;
    const copyCtx = copyCanvas.getContext('2d');

    // Flip the context horizontally if i === 0
    if (i === 0) {
        copyCtx.translate(canvas.width, 0);
        copyCtx.scale(-1, 1);
    }

    copyCtx.lineWidth = 10;

    person.forEach(pose => {
        const nose = pose.keypoints.find(kp => kp.name === 'nose');
        const lowestPoint = canvas.height;

        if (nose && nose.score > 0.2) {
            let adjustedXOffset = xOffset;

            // Gradually apply push factor
            if (nose.x < pushStart) {
                const t = (pushStart - nose.x) / (pushStart - pushEnd);
                const pushFactor = t * pushConstant * (canvas.width / nose.x);
                adjustedXOffset -= pushFactor;
            }

            // Body line
            copyCtx.beginPath();
            copyCtx.moveTo(nose.x + adjustedXOffset, nose.y + yOffset); // Apply adjusted X and Y offsets to the nose position
            copyCtx.lineTo(nose.x + adjustedXOffset, lowestPoint + yOffset); // Apply adjusted X and Y offsets to the line's endpoint
            copyCtx.strokeStyle = 'black';
            copyCtx.stroke();

            // Face circle
            const shoulderDist = Math.abs(pose.keypoints.find(kp => kp.name === 'left_shoulder').x - pose.keypoints.find(kp => kp.name === 'right_shoulder').x);
            const faceRadius = shoulderDist / 8;
            copyCtx.beginPath();
            copyCtx.arc(nose.x + adjustedXOffset, nose.y + yOffset, faceRadius, 0, 2 * Math.PI); // Apply adjusted X and Y offsets to the face position
            copyCtx.fillStyle = 'black';
            copyCtx.fill();
            copyCtx.stroke();
        }
    });

    // Reset the transformation before applying the blur
    copyCtx.setTransform(1, 0, 0, 1, 0, 0);

    // Apply Gaussian blur to the whole canvas
    for (let i = 0; i < 1; i++) {
        copyCtx.filter = `blur(${feather}px)`; // Apply Gaussian blur with the specified feather value
        copyCtx.drawImage(copyCanvas, 0, 0);
    }

    // Reset filter to remove blur effect
    copyCtx.filter = 'none';

    // Reapply the flip before redrawing the arms
    if (i === 0) {
        copyCtx.translate(canvas.width, 0);
        copyCtx.scale(-1, 1);
    }

    // Redraw the arms without the blur effect
    person.forEach(pose => {
        const nose = pose.keypoints.find(kp => kp.name === 'nose');
        if (nose && nose.score > 0.2) {
            const drawArm = (shoulder, elbow, wrist) => {
                const shoulderPoint = pose.keypoints.find(kp => kp.name === shoulder);
                const elbowPoint = pose.keypoints.find(kp => kp.name === elbow);
                const wristPoint = pose.keypoints.find(kp => kp.name === wrist);

                // Calculate vectors
                const elbowVector = {
                    x: elbowPoint.x - shoulderPoint.x,
                    y: elbowPoint.y - shoulderPoint.y
                };

                const wristVector = {
                    x: wristPoint.x - elbowPoint.x,
                    y: wristPoint.y - elbowPoint.y
                };

                // Gradually apply push factor for shoulder points
                let adjustedXOffset = xOffset;

                if (shoulderPoint.x < pushStart) {
                    const t = (pushStart - shoulderPoint.x) / (pushStart - pushEnd);
                    const pushFactor = t * pushConstant * (canvas.width / shoulderPoint.x);
                    adjustedXOffset -= pushFactor;
                }

                // Stretch vectors to make arms twice as long
                const stretchedElbow = {
                    x: shoulderPoint.x + 1 * elbowVector.x + adjustedXOffset, // Apply adjusted X offset to the stretched elbow position
                    y: shoulderPoint.y + 1 * elbowVector.y + yOffset // Apply Y offset to the stretched elbow position
                };

                const stretchedWrist = {
                    x: elbowPoint.x + 1 * wristVector.x + adjustedXOffset, // Apply adjusted X offset to the stretched wrist position
                    y: elbowPoint.y + 1 * wristVector.y + yOffset // Apply Y offset to the stretched wrist position
                };

                // Draw arm with stretched lengths
                copyCtx.beginPath();
                copyCtx.moveTo(nose.x + adjustedXOffset, (shoulderPoint.y + nose.y) / 2 + yOffset); // Apply adjusted X and Y offsets
                copyCtx.lineTo(stretchedElbow.x, stretchedElbow.y);
                copyCtx.lineTo(stretchedWrist.x, stretchedWrist.y);
                copyCtx.stroke();
            };

            drawArm('left_shoulder', 'left_elbow', 'left_wrist');
            drawArm('right_shoulder', 'right_elbow', 'right_wrist');
        }
    });

    // Reset the transformation before drawing to the main canvas
    copyCtx.setTransform(1, 0, 0, 1, 0, 0);

    // Draw the final result onto the original canvas
    ctx.drawImage(copyCanvas, 0, 0);

    // Return the copyCanvas
    return copyCanvas;
}