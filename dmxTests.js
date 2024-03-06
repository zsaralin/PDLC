import {updateCanvas} from "./filteredCanvas.js";
import {setDMXFromPixelCanvas} from "./dmx.js";
import {imgCol, imgRow} from "./imageRatio.js";

let sweepRow = 0; // This counter will track the current row for the sweep
const pixelatedCanvas = document.createElement('canvas');
const pixelatedCtx = pixelatedCanvas.getContext('2d', { willReadFrequently: true });
const gridWidth = 30; // Number of cells horizontally
const gridHeight = 28; // Number of cells vertically
pixelatedCanvas.width = gridWidth;
pixelatedCanvas.height = gridHeight;
function sweepDown() {
    // Clear the canvas or fill it with black
    pixelatedCtx.fillStyle = 'black';
    pixelatedCtx.fillRect(0, 0, imgCol, imgRow);
        pixelatedCtx.fillStyle = 'white';

    pixelatedCtx.fillRect(0, sweepRow, imgCol, 1)
    // Sweep effect: Draw a single white column based on sweepRow counter for vertical movement
    // for (let col = 0; col < 30; col++) {
    //     pixelatedCtx.fillStyle = 'white';
    //     pixelatedCtx.fillRect(col, sweepRow, 1, 1);
    // }
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

let startTime = Date.now(); // Store the start time

function getFadingColorValue() {
    const cycleTime = 10000; // Total time for a full fade in and fade out cycle
    const elapsed = (Date.now() - startTime) % cycleTime; // Time elapsed in the current cycle
    const fadeAmount = Math.abs((elapsed / (cycleTime / 2)) - 1); // Ranges from 0 to 1 to 0 over the cycle
    console.log(fadeAmount)
    const colorValue = Math.floor(fadeAmount * 255); // Convert to color value (0 to 255)
    return colorValue;
}

function drawSmileyFace() {
    const canvasWidth = imgCol; // Adjust as needed
    const canvasHeight = imgRow; // Adjust as needed
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const radius = Math.min(canvasWidth, canvasHeight) / 2; // Adjust the size of the face

    const colorValue = getFadingColorValue();
    const backgroundColorValue = 255 - colorValue; // Invert color for the background

    // Set background color
    pixelatedCtx.fillStyle = `rgb(${backgroundColorValue}, ${backgroundColorValue}, ${backgroundColorValue})`;
    pixelatedCtx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw the face
    pixelatedCtx.fillStyle = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
    pixelatedCtx.beginPath();
    pixelatedCtx.arc(centerX, centerY, radius, 0, Math.PI * 2, true); // Face
    pixelatedCtx.fill();

    // Eyes and mouth should contrast with the face, so we use the background color for them
    pixelatedCtx.fillStyle = `rgb(${backgroundColorValue}, ${backgroundColorValue}, ${backgroundColorValue})`;
    pixelatedCtx.beginPath();
    pixelatedCtx.arc(centerX - radius / 2.5, centerY - radius / 2.5, radius / 6, 0, Math.PI * 2, true);  // Left eye
    pixelatedCtx.arc(centerX + radius / 2.5, centerY - radius / 2.5, radius / 6, 0, Math.PI * 2, true);  // Right eye
    pixelatedCtx.fill();

    // Draw the mouth
    pixelatedCtx.strokeStyle = `rgb(${backgroundColorValue}, ${backgroundColorValue}, ${backgroundColorValue})`;
    pixelatedCtx.beginPath();
    pixelatedCtx.arc(centerX, centerY + radius / 4, radius / 3, 0, Math.PI, false);  // Smile
    pixelatedCtx.stroke();
}

function drawToad(){
    const img = new Image(); // Create a new Image object
    img.src = './toad.jpg'; // Set the source to the URL of the Mario image
    img.onload = () => {
        // Once the image is loaded, draw it on the canvas
        pixelatedCtx.drawImage(img, 0, 0, imgCol, imgRow); // Draw the image scaled to the canvas size
    };
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

export function drawDMXTest() {
    drawToad()
    const croppedImageData = pixelatedCanvas.toDataURL('image/png');
    updateCanvas('pixel-canvas', croppedImageData);
    const imageData = pixelatedCtx.getImageData(0, 0, pixelatedCanvas.width, pixelatedCanvas.height);

    setDMXFromPixelCanvas(imageData)
}