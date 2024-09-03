import { updateCanvas } from "../drawing/updateCanvas.js";
import { setDMXFromPixelCanvas } from "./sendDMX.js";
import { imgCol, imgRow } from "./imageRatio.js";
import { animateLinearGradientSweep } from "./animateLinearGradientSweep.js";
import { animateRadialGradientSweep } from "./animateRadialGradientSweep.js";
import { animateFadeScreen } from "./animateFadeScreen.js"; // Assuming this is the correct import

const pixelatedCanvas = document.createElement('canvas');
const pixelatedCtx = pixelatedCanvas.getContext('2d', { willReadFrequently: true });
pixelatedCanvas.width = imgCol;
pixelatedCanvas.height = imgRow;

export function fillCanvasWithBlack() {
    pixelatedCtx.fillStyle = `rgb(0, 0, 0)`;
    pixelatedCtx.fillRect(0, 0, imgCol, imgRow);
}

function fillCanvasWithWhite() {
    pixelatedCtx.fillStyle = `rgb(255, 255, 255)`;
    pixelatedCtx.fillRect(0, 0, imgCol, imgRow);
}

function fillCanvasWithGrey() {
    let shade = parseFloat(document.getElementById('grayShade').value);
    pixelatedCtx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
    pixelatedCtx.fillRect(0, 0, imgCol, imgRow);
}

let linearAnimationHandle = null;
let radialAnimationHandle = null;
let fadeAnimationHandle = null;

let pixelX = 0;
let pixelY = 0;

// Add event listener for keydown to move the pixel
document.addEventListener('keydown', (event) => {
    const key = event.key;
    switch (key) {
        case 'ArrowUp':
            if (pixelY > 0) {
                pixelY--;
            }
            break;
        case 'ArrowDown':
            if (pixelY < imgRow - 1) {
                pixelY++;
            }
            break;
        case 'ArrowLeft':
            if (pixelX > 0) {
                pixelX--;
            }
            break;
        case 'ArrowRight':
            if (pixelX < imgCol - 1) {
                pixelX++;
            }
            break;
    }
    drawPixelMover(); // Redraw the pixel at the new position
});

function drawPixelMover() {
    fillCanvasWithBlack(); // Clear the canvas
    pixelatedCtx.fillStyle = 'rgb(255, 255, 255)';
    pixelatedCtx.fillRect(pixelX, pixelY, 1, 1); // Draw the pixel at the new position

    const croppedImageData = pixelatedCanvas.toDataURL('image/png');
    updateCanvas(croppedImageData, 0);
    const imageData = pixelatedCtx.getImageData(0, 0, pixelatedCanvas.width, pixelatedCanvas.height);


    const pixelSmoothScreensaver = document.getElementById('pixelSmoothScreensaver');
    setDMXFromPixelCanvas(imageData, parseFloat(pixelSmoothScreensaver.value));
}
export function drawDMXTest() {
    const blackCheckbox = document.getElementById('blackScreen');
    const whiteCheckbox = document.getElementById('whiteScreen');
    const grayCheckbox = document.getElementById('grayScreen');
    const linearGrad = document.getElementById('linearGrad');
    const pixelMoverCheckbox = document.getElementById('pixelMover');
    const fadeScreenCheckbox = document.getElementById('fadeScreen');

    if (fadeScreenCheckbox.checked) {
        if (linearAnimationHandle) {
            linearAnimationHandle();
            linearAnimationHandle = null;
        }
        if (radialAnimationHandle) {
            radialAnimationHandle();
            radialAnimationHandle = null;
        }
        if (!fadeAnimationHandle) {
            fadeAnimationHandle = animateFadeScreen(pixelatedCtx)
            return
        }
    } else if (pixelMoverCheckbox.checked) {
        if (linearAnimationHandle) {
            linearAnimationHandle();
            linearAnimationHandle = null;
        }
        if (radialAnimationHandle) {
            radialAnimationHandle();
            radialAnimationHandle = null;
        }
        if (fadeAnimationHandle) {
            fadeAnimationHandle();
            fadeAnimationHandle = null;
        }
        drawPixelMover();
    } else if (blackCheckbox.checked) {
        if (linearAnimationHandle) {
            linearAnimationHandle();
            linearAnimationHandle = null;
        }
        if (radialAnimationHandle) {
            radialAnimationHandle();
            radialAnimationHandle = null;
        }
        if (fadeAnimationHandle) {
            fadeAnimationHandle();
            fadeAnimationHandle = null;
        }
        fillCanvasWithBlack();
    } else if (grayCheckbox.checked) {
        if (linearAnimationHandle) {
            linearAnimationHandle();
            linearAnimationHandle = null;
        }
        if (radialAnimationHandle) {
            radialAnimationHandle();
            radialAnimationHandle = null;
        }
        if (fadeAnimationHandle) {
            fadeAnimationHandle();
            fadeAnimationHandle = null;
        }
        fillCanvasWithGrey();
    } else if (whiteCheckbox.checked) {
        if (linearAnimationHandle) {
            linearAnimationHandle();
            linearAnimationHandle = null;
        }
        if (radialAnimationHandle) {
            radialAnimationHandle();
            radialAnimationHandle = null;
        }
        if (fadeAnimationHandle) {
            fadeAnimationHandle();
            fadeAnimationHandle = null;
        }
        fillCanvasWithWhite();
    } else if (linearGrad.checked) {
        if (radialAnimationHandle) {
            radialAnimationHandle();
            radialAnimationHandle = null;
        }
        if (fadeAnimationHandle) {
            fadeAnimationHandle();
            fadeAnimationHandle = null;
        }
        if (!linearAnimationHandle) {
            linearAnimationHandle = animateLinearGradientSweep(pixelatedCtx);
            return;
        }
    } else {
        if (linearAnimationHandle) {
            linearAnimationHandle();
            linearAnimationHandle = null;
        }
        if (fadeAnimationHandle) {
            fadeAnimationHandle();
            fadeAnimationHandle = null;
        }
        if (!radialAnimationHandle) {
            radialAnimationHandle = animateRadialGradientSweep(pixelatedCtx);
            return;
        }
    }

    const croppedImageData = pixelatedCanvas.toDataURL('image/png');
    updateCanvas(croppedImageData, 0);
    const imageData = pixelatedCtx.getImageData(0, 0, pixelatedCanvas.width, pixelatedCanvas.height);
    const pixelSmoothScreensaver = document.getElementById('pixelSmoothScreensaver');
    setDMXFromPixelCanvas(imageData, parseFloat(pixelSmoothScreensaver.value));
}
