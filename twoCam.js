import { setDMXFromPixelCanvas } from "./dmx/dmx.js";
import { updateCanvas } from "./drawing/drawROI.js";
import { getPixelImageData } from "./filters/pixelated.js";

let fade_dur = 1000;
let switch_dur = 8000;
let fadeColor = "black"; // Can be "black" or "white"

let cam0 = false;
let cam1 = false;

export function setCam0(status) {
    cam0 = status;
}

export function setCam1(status) {
    cam1 = status;
}

let currentCamIndex = 0; 
let intervalId = null; 


let fadingBlack = false; 
let isSwitching = false; 


export function preDMX() {
    if(offPixelCanvases.length === 0) return
    if (cam0 && !cam1) {
        if (isSwitching && currentCamIndex !== 0) {
            fadeCanvasToBlackAndBack(currentCamIndex)
            isSwitching = false;
            setTimeout(() => {
                if (intervalId !== null) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
                currentCamIndex = 0;
                setDMXFromPixelCanvas(getPixelImageData(currentCamIndex));
            }, fade_dur);
        } else {
            if (intervalId !== null) {
                clearInterval(intervalId);
                intervalId = null;
            }
            currentCamIndex = 0;
            setDMXFromPixelCanvas(getPixelImageData(currentCamIndex));
        }
        isBlack = false;
        
    } else if (!cam0 && cam1) {
        if (isSwitching && currentCamIndex !== 0) {
            fadeCanvasToBlackAndBack(currentCamIndex)
            isSwitching = false;
            setTimeout(() => {
                if (intervalId !== null) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
                currentCamIndex = 1;
                setDMXFromPixelCanvas(getPixelImageData(currentCamIndex));
            }, fade_dur);
        } else {
            if (intervalId !== null) {
                clearInterval(intervalId);
                intervalId = null;
            }
            currentCamIndex = 1;
            setDMXFromPixelCanvas(getPixelImageData(currentCamIndex));
        }
        isBlack = false;
        
    } else if (cam0 && cam1) {
        isBlack = false;
        isSwitching = true;
        if (!fadingBlack) {
            setDMXFromPixelCanvas(getPixelImageData(currentCamIndex));
        }
        if (intervalId === null) {
            switchCameras(); // Immediately call to ensure we start with the latest data
            intervalId = setInterval(switchCameras, switch_dur); // Switch every 15 seconds
        }
    } else {
        fadeCanvasToBlack(currentCamIndex)
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }
}

function switchCameras() {
    fadeCanvasToBlackAndBack(currentCamIndex)
    setTimeout(() => {
        fadingBlack = false;
    }, fade_dur);
}

let offPixelCanvases = [];

export function sendPixelCanvas(pixelatedCanvases){
    offPixelCanvases = pixelatedCanvases
}

function fadeCanvasToBlackAndBack(canvasIndex, duration = fade_dur) {
    if (fadingBlack) return;
    fadingBlack = true;
    const canvas = offPixelCanvases[canvasIndex];
    const ctx = canvas.getContext('2d');
    const fps = 30; // Frames per second for the fade effect
    const totalFrames = (duration / 1000) * fps / 2; // Split duration for fading in and out
    let currentFrame = 0;
    const colorValue = fadeColor === "black" ? "0, 0, 0" : "255, 255, 255";

    // Function to update the fade effect
    const updateFadeEffect = (frame) => {
        // Calculate current opacity: First half increases to 1, second half decreases to 0
        const halfWay = totalFrames;
        let opacity;
        if (frame <= halfWay) {
            // Fade in (increase opacity)
            opacity = frame / halfWay;
        } else {
            currentCamIndex = (currentCamIndex === 0 ? 1 : 0);

            // Fade out (decrease opacity)
            opacity = 1 - ((frame - halfWay) / halfWay);
        }
        return `rgba(${colorValue}, ${opacity})`;
    };

    const fadeStep = () => {
        if (currentFrame < totalFrames * 2) { // Multiply by 2 to account for fade in and fade out
            ctx.fillStyle = updateFadeEffect(currentFrame);
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const croppedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            // imageDatas[currentCamIndex] = croppedImageData;
            const dataURL = canvas.toDataURL('image/png');
            updateCanvas('pixel-canvas', dataURL, canvasIndex);
            setDMXFromPixelCanvas(getPixelImageData(currentCamIndex), 1);
            currentFrame++;
            requestAnimationFrame(fadeStep);
        } else {
            fadingBlack = false;
        }
    };

    fadeStep();
}

let isBlack = false;
function fadeCanvasToBlack(canvasIndex, duration = fade_dur) {
    if (isBlack) return;
    isBlack = true;
    const canvas = offPixelCanvases[canvasIndex];
    const ctx = canvas.getContext('2d');
    const fps = 30; // Frames per second for the fade effect
    const totalFrames = (duration / 1000) * fps; // Total number of frames based on the duration
    let currentFrame = 0;
    const increment = 1 / totalFrames; // Incremental increase in opacity per frame
    const colorValue = fadeColor === "black" ? "0, 0, 0" : "255, 255, 255";
    
    const fadeStep = () => {
        if (currentFrame <= totalFrames) {
            let opacity = increment * currentFrame;
            ctx.fillStyle = `rgba(${colorValue}, ${opacity})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const croppedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            // imageDatas[currentCamIndex] = croppedImageData;
            const dataURL = canvas.toDataURL('image/png');
            updateCanvas('pixel-canvas', dataURL, canvasIndex);
            setDMXFromPixelCanvas(getPixelImageData(currentCamIndex), 1);

            if (opacity < 1) {
                currentFrame++;
                requestAnimationFrame(fadeStep);
            } else {
            }
        }
    };

    fadeStep();
}

document.addEventListener('DOMContentLoaded', () => {
    const fadeColourSelect = document.getElementById('fadeColour');

    const fadeDurInput = document.getElementById('fadeDur');
    const switchDurInput = document.getElementById('switchDur');
    const fadeDurValSpan = document.getElementById('fadeDurVal');
    const switchDurValSpan = document.getElementById('switchDurVal');

    let fadeDuration = parseInt(fadeDurInput.value, 10); // Default from HTML
    let switchDuration = parseInt(switchDurInput.value, 10) * 1000; // Convert seconds to milliseconds

    function updateFadeColorFromSelect() {
        const fadeColourSelect = document.getElementById('fadeColour');
        fadeColor = fadeColourSelect.value; // Update fadeColor based on the select's value
        console.log(fadeColor)
    }

    const updateFadeDuration = () => {
        fadeDurValSpan.textContent = `${fadeDurInput.value} ms`;
        fadeDuration = parseInt(fadeDurInput.value, 10); // Update variable
    };

    const updateSwitchDuration = () => {
        switchDurValSpan.textContent = `${switchDurInput.value} s`;
        switchDuration = parseInt(switchDurInput.value, 10) * 1000; // Convert to milliseconds and update variable
    };

    updateFadeColorFromSelect();
    updateFadeDuration();
    updateSwitchDuration();

    fadeColourSelect.addEventListener('change', updateFadeColorFromSelect);
    fadeDurInput.addEventListener('input', updateFadeDuration);
    switchDurInput.addEventListener('input', updateSwitchDuration);
});