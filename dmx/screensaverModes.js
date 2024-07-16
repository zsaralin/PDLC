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
    const visibleCanvasHeight = imgRow * 1; // Canvas height, adjust as needed
    const extendedCanvasHeight = visibleCanvasHeight * 2; // Extended height for longer transitions

    let gradientOffset = 0;  // Initialize gradient offset
    let direction = 1;  // Initialize direction (1 for down, -1 for up)
    let timeoutHandle = null; // Store the timeout handle to allow clearing
    let delayCounter = 0; // Counter to introduce delay at fully black/white states
    const delayFrames = 10; // Number of frames to delay

    // Define the update function that uses setTimeout for dynamic intervals
    const updateGradient = () => {
        // Create a linear gradient from top to bottom
        let gradient = pixelatedCtx.createLinearGradient(0, -extendedCanvasHeight / 2 + gradientOffset, 0, extendedCanvasHeight / 2 + gradientOffset);

        // Add color stops to create a sharp transition
        gradient.addColorStop(0, 'rgb(0, 0, 0)'); // Black at the start
        gradient.addColorStop(0.35, 'rgb(0, 0, 0)'); // Black close to the middle
        gradient.addColorStop(0.65, 'rgb(255, 255, 255)'); // White close to the middle
        gradient.addColorStop(1, 'rgb(255, 255, 255)'); // White at the end

        // Apply the gradient as fill style and fill the canvas
        pixelatedCtx.fillStyle = gradient;
        pixelatedCtx.fillRect(0, 0, canvasWidth, visibleCanvasHeight);

        // Update the gradient offset continuously
        if (delayCounter > 0) {
            delayCounter--;
        } else {
            gradientOffset += direction; // Update by a fixed small increment

            // Change direction if gradientOffset reaches the extended canvas height bounds
            if (gradientOffset >= extendedCanvasHeight / 1.8) {
                direction = -1;  // Reverse the direction
                delayCounter = delayFrames; // Introduce delay at fully white state
            } else if (gradientOffset <= -extendedCanvasHeight / 2) {
                direction = 1;  // Reverse the direction
                delayCounter = delayFrames; // Introduce delay at fully black state
            }
        }

        // Schedule the next update, using the value from the input field to determine the interval
        timeoutHandle = setTimeout(updateGradient, parseFloat(document.getElementById('animSpeed').value));
    };

    // Start the first update
    updateGradient();

    // Return a function to stop the animation
    return () => {
        clearTimeout(timeoutHandle);
        linearAnimationHandle = false;
    };
}
function animateRadialGradientSweep() {
    console.log('ANIMATE GRADIENT SWEEP"')
    const canvasWidth = imgCol; // Canvas width, adjust as needed
    const canvasHeight = imgRow * 1; // Canvas height, adjust as needed
    const maxRadius = Math.sqrt(canvasWidth ** 2.2 + canvasHeight ** 2.2); // Maximum radius to cover the canvas

    let gradientOffset = 0;  // Initialize gradient offset
    let direction = 1;  // Initialize direction (1 for expanding, -1 for contracting)
    let timeoutHandle = null; // Store the timeout handle to allow clearing

    // Function to get random center coordinates
    const getRandomCenter = () => {
        return {
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight
        };
    };

    let center = getRandomCenter(); // Initialize with random center coordinates

    // Define the update function that uses setTimeout for dynamic intervals
    const updateGradient = () => {
        // Clear the canvas
        pixelatedCtx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Create a radial gradient with the random center
        let gradient = pixelatedCtx.createRadialGradient(
            center.x, center.y, 0, // Inner circle (center)
            center.x, center.y, gradientOffset // Outer circle (expanding/contracting)
        );

        // Add color stops for black background and white circle
        gradient.addColorStop(0, 'rgb(255, 255, 255)'); // White at the center
        gradient.addColorStop(1, 'rgb(0, 0, 0)'); // Black at the outer edge

        // Apply the gradient as fill style and fill the canvas
        pixelatedCtx.fillStyle = gradient;
        pixelatedCtx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Update the gradient offset continuously
        gradientOffset += direction * 1; // Update by a fixed small increment

        // Change direction if gradientOffset reaches the bounds
        if (gradientOffset >= maxRadius) {
            direction = -1;  // Reverse the direction
        } else if (gradientOffset <= 0) {
            direction = 1;  // Reverse the direction
            center = getRandomCenter(); // Get new random center
        }

        // Schedule the next update, using the value from the input field to determine the interval
        timeoutHandle = setTimeout(updateGradient, parseFloat(document.getElementById('animSpeed').value));
    };

    // Start the first update
    updateGradient();

    // Return a function to stop the animation
    return () => {
        clearTimeout(timeoutHandle);
        radialAnimationHandle = false;
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

export function fillCanvasWithBlack() {
    // Clear the canvas or fill it with grey
    pixelatedCtx.fillStyle = `rgb(${0}, ${0}, ${0})`;
    pixelatedCtx.fillRect(0, 0, imgCol, imgRow);

}

function fillCanvasWithWhite() {
    // Clear the canvas or fill it with grey
    pixelatedCtx.fillStyle = `rgb(${255}, ${255}, ${255})`;
    pixelatedCtx.fillRect(0, 0, imgCol, imgRow);
}

function fillCanvasWithGrey() {
    let shade = parseFloat(document.getElementById('grayShade').value); // Speed of animation from the input

    // Clear the canvas or fill it with grey
    pixelatedCtx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
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
const grayCheckbox = document.getElementById('grayScreen')

const linearGrad = document.getElementById('linearGrad')

let linearAnimationHandle;    // Handle for the animation to control its lifecycle
let radialAnimationHandle;
export function drawDMXTest() {


    // Check for black or white checkbox states
    if (blackCheckbox.checked) {
        if(linearAnimationHandle) linearAnimationHandle()
        if (radialAnimationHandle) radialAnimationHandle()
        fillCanvasWithBlack();
    } else if (grayCheckbox.checked) {
        if(linearAnimationHandle) linearAnimationHandle()
        if (radialAnimationHandle) radialAnimationHandle()
        fillCanvasWithGrey();
    } else if (whiteCheckbox.checked) {
        if (linearAnimationHandle) linearAnimationHandle()
        if (radialAnimationHandle) radialAnimationHandle()
        fillCanvasWithWhite();
    } else if(linearGrad.checked){
        if (radialAnimationHandle) radialAnimationHandle()
        if (!linearAnimationHandle) {
            // Start the gradient animation if no boxes are checked
            linearAnimationHandle = animateGradientSweep();
            return;  // Skip the rest of the function if starting an animation
        }
    } else {
        if (linearAnimationHandle) linearAnimationHandle()
        if (!radialAnimationHandle) {
            // Start the gradient animation if no boxes are checked
            radialAnimationHandle = animateRadialGradientSweep();
            return;  // Skip the rest of the function if starting an animation
        }
    }

    // Common operations for black or white canvas
    const croppedImageData = pixelatedCanvas.toDataURL('image/png');
    updateCanvas('pixel-canvas', croppedImageData, 0);
    const imageData = pixelatedCtx.getImageData(0, 0, pixelatedCanvas.width, pixelatedCanvas.height);
    setDMXFromPixelCanvas(imageData);
}