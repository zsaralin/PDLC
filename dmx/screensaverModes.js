import {updateCanvas} from "../drawing/updateCanvas.js";
import {setDMXFromPixelCanvas} from "./dmx.js";
import {imgCol, imgRow} from "./imageRatio.js";

let sweepRow = 0; // This counter will track the current row for the sweep

const pixelatedCanvas = document.createElement('canvas');
const pixelatedCtx = pixelatedCanvas.getContext('2d', {willReadFrequently: true});
pixelatedCanvas.width = imgCol;
pixelatedCanvas.height = imgRow;

export function getScreensaverCanvas() {
    return pixelatedCanvas
}

function sweepDown() {
    pixelatedCtx.fillStyle = 'black';
    pixelatedCtx.fillRect(0, 0, imgCol, imgRow);
    pixelatedCtx.fillStyle = 'white';

    for (let col = 0; col < 30; col++) {
        pixelatedCtx.fillStyle = 'white';
        pixelatedCtx.fillRect(col, sweepRow, 1, 1);
    }
    sweepRow++;
    if (sweepRow >= imgRow) sweepRow = 0; // Reset for vertical movement
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

let gradientOffset = 0; // Initialize the gradient offset
let isSweepingDown = true; // Flag to indicate the direction of the sweep

export function resetGradientSweep() {
    gradientOffset = 0;
    isSweepingDown = true;
}
function animateGradientBar() {
    const canvasWidth = imgCol; // Canvas width, adjust as needed
    const canvasHeight = imgRow; // Canvas height, adjust as needed

    let gradientOffset = 0;  // Initialize gradient offset
    let isSweepingDown = true; // Initial direction of the gradient sweep
    let animSpeed = parseFloat(document.getElementById('animSpeed').value); // Speed of animation from the input

    const updateGradient = () => {
        // Create a linear gradient
        let gradient = pixelatedCtx.createLinearGradient(0, 0, 0, canvasHeight);

        // Calculate position of the gradient stop within the canvas, ensuring it wraps smoothly
        let position = gradientOffset / canvasHeight;
        let fadeLength = 0.8; // Length of the gradient fade, adjust as needed

        // Set gradient transitions using calculated position
        gradient.addColorStop(Math.max(0, position - fadeLength), 'rgb(0, 0, 0)'); // Start fading from black
        gradient.addColorStop(position, 'rgb(255, 255, 255)'); // Full white at the middle of the gradient
        gradient.addColorStop(Math.min(1, position + fadeLength), 'rgb(0, 0, 0)'); // End fading to black

        // Apply the gradient as fill style and fill the canvas
        pixelatedCtx.fillStyle = gradient;
        pixelatedCtx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Update the gradient offset based on the direction
        if (isSweepingDown) {
            gradientOffset += animSpeed;
            if (gradientOffset > canvasHeight) {
                isSweepingDown = false;
                gradientOffset = canvasHeight; // Correct for overshoot
            }
        } else {
            gradientOffset -= animSpeed;
            if (gradientOffset < 0) {
                isSweepingDown = true;
                gradientOffset = 0; // Correct for undershoot
            }
        }
    };

    // Start the interval to update the gradient every 20 milliseconds
    const intervalId = setInterval(updateGradient, 20);

    // Return a function to stop the animation
    return () => {
        clearInterval(intervalId);
    };
}
function animateGradientSweep() {
    const canvasWidth = imgCol; // Canvas width, adjust as needed
    const canvasHeight = imgRow * 1.5; // Canvas height, adjust as needed

    let gradientOffset = 0;  // Initialize gradient offset
    let timeoutHandle = null; // Store the timeout handle to allow clearing

    // Define the update function that uses setTimeout for dynamic intervals
    const updateGradient = () => {
        // Create a linear gradient
        let gradient = pixelatedCtx.createLinearGradient(0, 0, 0, canvasHeight);

        // Ensure the gradient offsets cycle correctly from 0 to canvasHeight and back
        let colorStopPosition = Math.abs((gradientOffset % (canvasHeight * 2)) - canvasHeight) / canvasHeight;

        // Configure the gradient to have a seamless transition
        gradient.addColorStop(colorStopPosition, 'rgb(255, 255, 255)'); // White transitions through the middle
        gradient.addColorStop(Math.max(0, colorStopPosition - 0.7), 'rgb(0, 0, 0)'); // Black fills the rest

        // Apply the gradient as fill style and fill the canvas
        pixelatedCtx.fillStyle = gradient;
        pixelatedCtx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Update the gradient offset continuously
        gradientOffset += 0.3; // Update by a fixed small increment
        if (gradientOffset >= canvasHeight * 2) {  // When it reaches double the height, it resets
            gradientOffset = 0;  // Reset to loop seamlessly
        }

        // Schedule the next update, using the value from the input field to determine the interval
        timeoutHandle = setTimeout(updateGradient, parseFloat(document.getElementById('animSpeed').value));
    };

    // Start the first update
    updateGradient();

    // Return a function to stop the animation
    return () => {
        clearTimeout(timeoutHandle);
        animationHandle = false;
    };
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
    if (sweepRow > 29) sweepRow = 0; // Correct reset condition for horizontal movement
}

function sweepRight() {
    // Clear the canvas or fill it with black
    pixelatedCtx.fillStyle = 'black';
    pixelatedCtx.fillRect(0, 0, imgCol, imgRow);

    // Sweep effect: Draw a single white column from right to left based on sweepRow counter for horizontal movement
    let colToDraw = 29 - sweepRow; // Calculate the column to draw from right to left
    for (let row = 0; row < 30; row++) {
        pixelatedCtx.fillStyle = 'white';
        pixelatedCtx.fillRect(colToDraw, row, 1, 1);
    }
    sweepRow++;
    if (sweepRow > 29) sweepRow = 0; // Reset for horizontal movement, moving left
}

let greyValue = 0; // Initial grey value
document.addEventListener('keydown', handleKeyPress);

function fillCanvasWithBlack() {
    // Clear the canvas or fill it with grey
    pixelatedCtx.fillStyle = `rgb(${0}, ${0}, ${0})`;
    pixelatedCtx.fillRect(0, 0, imgCol, imgRow);
    pixelatedCtx.fillStyle = `rgb(${255}, ${255}, ${255})`;
    pixelatedCtx.fillRect(2, 0, 1, imgRow);
}

function fillCanvasWithWhite() {
    // Clear the canvas or fill it with grey
    pixelatedCtx.fillStyle = `rgb(${255}, ${255}, ${255})`;
    pixelatedCtx.fillRect(0, 0, imgCol, imgRow);
}

function handleKeyPress(event) {
    if (event.key === 'ArrowUp') {
        // Increase grey value (make lighter)
        greyValue = Math.min(greyValue + 10, 255);
        drawDMXTest();
    } else if (event.key === 'ArrowDown') {
        // Decrease grey value (make darker)
        greyValue = Math.max(greyValue - 10, 0);
        drawDMXTest();
    }
}

const blackCheckbox = document.getElementById('blackScreen')
const whiteCheckbox = document.getElementById('whiteScreen')

let testDrawn = false;
let animationHandle;    // Handle for the animation to control its lifecycle

export function drawDMXTest() {
    // Check for black or white checkbox states
    if (blackCheckbox.checked) {
        if(animationHandle) animationHandle()
        fillCanvasWithBlack();
    } else if (whiteCheckbox.checked) {
        if(animationHandle) animationHandle()
        fillCanvasWithWhite();
    } else {
        if (!animationHandle) {

            // Start the gradient animation if no boxes are checked
            animationHandle = animateGradientSweep();
            return;  // Skip the rest of the function if starting an animation
        }
    }

    // Common operations for black or white canvas
    const croppedImageData = pixelatedCanvas.toDataURL('image/png');
    updateCanvas('pixel-canvas', croppedImageData, 0);
    const imageData = pixelatedCtx.getImageData(0, 0, pixelatedCanvas.width, pixelatedCanvas.height);
    setDMXFromPixelCanvas(imageData);
}