import {updateCanvas} from "../drawing/drawROI.js";
import {setDMXFromPixelCanvas} from "./dmx.js";
import {imgCol, imgRow} from "../imageRatio.js";

let sweepRow = 0; // This counter will track the current row for the sweep

const pixelatedCanvas = document.createElement('canvas');
const pixelatedCtx = pixelatedCanvas.getContext('2d', { willReadFrequently: true });
pixelatedCanvas.width = 30;
pixelatedCanvas.height = 28;

function sweepDown() {
    // Clear the canvas or fill it with black
    pixelatedCtx.fillStyle = 'black';
    pixelatedCtx.fillRect(0, 0, imgCol, imgRow);
    pixelatedCtx.fillStyle = 'white';

    // Sweep effect: Draw a single white column based on sweepRow counter for vertical movement
    for (let col = 0; col < 30; col++) {
        pixelatedCtx.fillStyle = 'white';
        pixelatedCtx.fillRect(col, sweepRow, 1, 1);
    }
    sweepRow++;
    if(sweepRow >= imgRow) sweepRow = 0; // Reset for vertical movement
}
function drawStripes() {
    const canvasWidth = 30; // Width of the canvas
    const canvasHeight = 28; // Height of the canvas
    const stripeHeight = 1; // Height of each stripe
    const gap = 1; // Gap between stripes

    pixelatedCtx.fillStyle = 'white';
    pixelatedCtx.fillRect(0, 0, canvasWidth, canvasHeight); // Fill the background

    // Set the color for the stripes
    pixelatedCtx.fillStyle = 'black';

    // Draw stripes
    for (let y = 0; y < canvasHeight; y += stripeHeight + gap) {
        pixelatedCtx.fillRect(0, y, canvasWidth, stripeHeight);
    }
}
let fadeCounter = 0; // Initialize outside the function
let increasing = true; // Flag to track whether we're increasing or decreasing the color value

function drawSmileyFaceFade() {
    const canvasWidth = imgCol; // Adjust as needed
    const canvasHeight = imgRow; // Adjust as needed
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const radius = Math.min(canvasWidth, canvasHeight) / 2; // Adjust the size of the face

    // Adjust the fadeCounter based on the increasing flag
    if (increasing) {
        fadeCounter += 1;
        if (fadeCounter >= 180) {
            increasing = false;
        }
    } else {
        fadeCounter -= 1;
        if (fadeCounter <= 50) {
            increasing = true;
        }
    }

    // Ensure the color value stays within the specified range
    const rgbValue = Math.max(50, Math.min(fadeCounter, 180));
    const colorString = `rgb(${rgbValue},${rgbValue},${rgbValue})`;

    // Clear the canvas or fill it with the calculated background color
    pixelatedCtx.fillStyle = colorString; // Use the dynamic color for the face background
    pixelatedCtx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw the face
    pixelatedCtx.fillStyle = colorString; // Use the dynamic color for the face
    pixelatedCtx.beginPath();
    pixelatedCtx.arc(centerX, centerY, radius, 0, Math.PI * 2, true); // Face
    pixelatedCtx.fill();

    // Calculate the inverse color for eyes and mouth
    const inverseColorValue = 255 - rgbValue;
    const inverseColorString = `rgb(${inverseColorValue},${inverseColorValue},${inverseColorValue})`;

    // Draw the eyes
    pixelatedCtx.fillStyle = inverseColorString; // Use the inverse dynamic color for eyes
    pixelatedCtx.beginPath();
    pixelatedCtx.arc(centerX - radius / 2.5, centerY - radius / 2.5, radius / 6, 0, Math.PI * 2, true);  // Left eye
    pixelatedCtx.arc(centerX + radius / 2.5, centerY - radius / 2.5, radius / 6, 0, Math.PI * 2, true);  // Right eye
    pixelatedCtx.fill();
    // Draw the mouth
    pixelatedCtx.strokeStyle = inverseColorString; // Use the inverse dynamic color for the mouth
    pixelatedCtx.beginPath();
    pixelatedCtx.arc(centerX, centerY, radius / 1.5, 0, Math.PI, false);  // Mouth (half circle)
    pixelatedCtx.stroke();
}

function drawSmileyFace() {
    const canvasWidth = imgCol; // Adjust as needed
    const canvasHeight = imgRow; // Adjust as needed
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const radius = Math.min(canvasWidth, canvasHeight) / 2; // Adjust the size of the face

    // Clear the canvas or fill it with a background color
    pixelatedCtx.fillStyle = 'white';
    pixelatedCtx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw the face
    pixelatedCtx.fillStyle = 'yellow';
    pixelatedCtx.beginPath();
    pixelatedCtx.arc(centerX, centerY, radius, 0, Math.PI * 2, true); // Face
    pixelatedCtx.fill();

    // Draw the eyes
    pixelatedCtx.fillStyle = 'black';
    pixelatedCtx.beginPath();
    pixelatedCtx.arc(centerX - radius / 2.5, centerY - radius / 2.5, radius / 6, 0, Math.PI * 2, true);  // Left eye
    pixelatedCtx.arc(centerX + radius / 2.5, centerY - radius / 2.5, radius / 6, 0, Math.PI * 2, true);  // Right eye
    pixelatedCtx.fill();

    // Draw the mouth
    pixelatedCtx.beginPath();
    pixelatedCtx.arc(centerX, centerY, radius / 1.5, 0, Math.PI, false);  // Mouth (half circle)
    pixelatedCtx.stroke();
}

function sweepLeft() {
    // Clear the canvas or fill it with black
    pixelatedCtx.fillStyle = 'black';
    pixelatedCtx.fillRect(0, 0, 30, 28);

    // Sweep effect: Draw a single white column based on sweepRow counter for horizontal movement
    for (let row = 0; row < 28; row++) {
        pixelatedCtx.fillStyle = 'white';
        pixelatedCtx.fillRect(sweepRow, row, 1, 1);
    }
    sweepRow++;
    if(sweepRow > 29) sweepRow = 0; // Correct reset condition for horizontal movement
}

function sweepRight() {
    // Clear the canvas or fill it with black
    pixelatedCtx.fillStyle = 'black';
    pixelatedCtx.fillRect(0, 0, 30, 28);

    // Sweep effect: Draw a single white column from right to left based on sweepRow counter for horizontal movement
    let colToDraw = 29 - sweepRow; // Calculate the column to draw from right to left
    for (let row = 0; row < 28; row++) {
        pixelatedCtx.fillStyle = 'white';
        pixelatedCtx.fillRect(colToDraw, row, 1, 1);
    }
    sweepRow++;
    if(sweepRow > 29) sweepRow = 0; // Reset for horizontal movement, moving left
}
let greyValue = 0; // Initial grey value
document.addEventListener('keydown', handleKeyPress);

function fillCanvasWithGrey() {
    console.log(greyValue)
    // Clear the canvas or fill it with grey
    pixelatedCtx.fillStyle = `rgb(${greyValue}, ${greyValue}, ${greyValue})`;
    pixelatedCtx.fillRect(0, 0, 30, 28);
}

function handleKeyPress(event) {
    if (event.key === 'ArrowUp') {
        // Increase grey value (make lighter)
        greyValue = Math.min(greyValue+10, 255);
        drawDMXTest();
    } else if (event.key === 'ArrowDown') {
        // Decrease grey value (make darker)
        greyValue = Math.max(greyValue-10, 0);
        drawDMXTest();
    }
}

export function drawDMXTest() {
    drawSmileyFaceFade()
    const croppedImageData = pixelatedCanvas.toDataURL('image/png');
    updateCanvas('pixel-canvas', croppedImageData);
    const imageData = pixelatedCtx.getImageData(0, 0, pixelatedCanvas.width, pixelatedCanvas.height);
    setDMXFromPixelCanvas(imageData)
}