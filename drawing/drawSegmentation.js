import { createBackgroundSegmenter } from "../detection/backgroundSegmenter.js";

let bgSegmenters;
export async function initBgSegmenters() {
    bgSegmenters = await createBackgroundSegmenter();
}

export async function getSegmentation(canvas, i) {
    if (!bgSegmenters) await initBgSegmenters();
    if(canvas) {
        return bgSegmenters[i].segmentPeople(canvas, {
            flipHorizontal: false,
            internalResolution: 'full',
            segmentBodyParts: false,        // maxDetections: 5,
            segmentationThreshold: .2,
            multiSegmentation: true,
        });
    }
}


export async function drawSegmentation(canvas, ctx, person) {
    const fg = document.getElementById('fg');

    const stretchXElement = document.getElementById('stretchX');
    const stretchYElement = document.getElementById('stretchY');
    const stretchX = parseFloat(stretchXElement.value);
    const stretchY = parseFloat(stretchYElement.value);

    function valueToColor(value) {
        if (value <= -1) {
            return { r: 255, g: 255, b: 255, a: 255 }; // Opaque white
        } else if (value >= 1) {
            return { r: 0, g: 0, b: 0, a: 255 }; // Opaque black
        } else {
            const alpha = Math.abs(value) * 255;
            if (value > 0) {
                return { r: 0, g: 0, b: 0, a: alpha }; // Black with variable transparency
            } else {
                return { r: 255, g: 255, b: 255, a: alpha }; // White with variable transparency
            }
        }
    }

    const foregroundColor = valueToColor(fg.value);
    const backgroundColor = { r: 0, g: 0, b: 0, a: 0 }; // Transparent background

    // Create a binary mask
    const mask = await bodySegmentation.toBinaryMask(person, foregroundColor, backgroundColor);

    // Create an offscreen canvas for resizing the mask
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.putImageData(new ImageData(new Uint8ClampedArray(mask.data), mask.width, mask.height), 0, 0);

    // Calculate the stretched dimensions
    const stretchedWidth = canvas.width * stretchX;
    const stretchedHeight = canvas.height * stretchY;

    // Clear the main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the resized black mask on the main canvas
    const maskCenterX = (canvas.width - stretchedWidth) / 2;
    const maskCenterY = (canvas.height - stretchedHeight) / 2;
    ctx.drawImage(offscreenCanvas, 0, 0, mask.width, mask.height, maskCenterX, maskCenterY, stretchedWidth, stretchedHeight);

    return canvas;
}

export let segmentationBrightness = 128;
