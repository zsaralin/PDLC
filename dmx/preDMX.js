import { setDMXFromPixelCanvas } from "./dmx.js";
import { updateCanvas } from "../drawing/updateCanvas.js";
import { getPixelImageData } from "../drawing/pixelCanvasUtils.js";
import { fadeToScreensaver } from "./fadeToScreensaver.js";
import { fillCanvasWithBlack, resetGradientSweep } from "./screensaverModes.js";
import { drawSegmentation } from "../drawing/drawSegmentation.js";

export let fade_dur = 1000;
let switch_dur = 8000;
let pause_dur = 1000;

let fadeColor = "black"; // Can be "black" or "white"

let cam0 = false;
let cam1 = false;

export function setCam0(status) {
    cam0 = status;
}

export function setCam1(status) {
    cam1 = status;
}

export let currentCamIndex = 0;
let intervalId = null;

let fadingBlack = false;
let isSwitching = false;

const pixelSmoothPerson = document.getElementById('pixelSmoothPerson');
const pixelSmoothScreensaver = document.getElementById('pixelSmoothScreensaver');

const delaytime = 0;
let isScreensaver = false;
let isAnim = false;

let previousNonZeroTwoValue = parseFloat(pixelSmoothPerson.value); // Initialize with the current value

export async function preDMX(currFaces0, currFaces1, canvas, ctx) {
    const updateValueWithDelay = (value, delay) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (value === parseFloat(pixelSmoothScreensaver.value)) {
                    previousNonZeroTwoValue = parseFloat(pixelSmoothPerson.value);
                }
                pixelSmoothPerson.value = (value === parseFloat(pixelSmoothScreensaver.value)) ? pixelSmoothScreensaver.value : previousNonZeroTwoValue;
                resolve();
            }, delay);
        });
    };

    if (cam0 && cam1) {
        isScreensaver = false;
        await updateValueWithDelay(previousNonZeroTwoValue, delaytime);
        setDMXFromPixelCanvas(getPixelImageData(0), parseFloat(pixelSmoothPerson.value));
    } else if (!cam0 && cam1) {
        isScreensaver = false;
        await updateValueWithDelay(previousNonZeroTwoValue, delaytime);
        setDMXFromPixelCanvas(getPixelImageData(0), parseFloat(pixelSmoothPerson.value));
    } else if (!cam1 && cam0) {
        isScreensaver = false;
        await updateValueWithDelay(previousNonZeroTwoValue, delaytime);
        setDMXFromPixelCanvas(getPixelImageData(0), parseFloat(pixelSmoothPerson.value));
    } else {
        await updateValueWithDelay(parseFloat(pixelSmoothScreensaver.value), delaytime);
        if (!isScreensaver && !isAnim) {
            isAnim = true;
            const black = document.getElementById('blackScreen');
            black.checked = true;
            setTimeout(() => {
                black.checked = false;
                isScreensaver = true;
                isAnim = false;
            }, 4000);
        }
        fadeToScreensaver();
        setDMXFromPixelCanvas(getPixelImageData(0), parseFloat(pixelSmoothScreensaver.value));
    }
}

function switchCameras() {
    fadeCanvasToBlackAndBack(currentCamIndex);
    setTimeout(() => {
        fadingBlack = false;
    }, fade_dur);
}

let offPixelCanvases = [];

export function sendPixelCanvas(pixelatedCanvases) {
    offPixelCanvases = pixelatedCanvases;
}

export function getPixelCanvases() {
    return offPixelCanvases;
}

function fadeCanvasToBlackAndBack(canvasIndex, duration = fade_dur) {
    if (fadingBlack) return;
    fadingBlack = true;
    let canvas = offPixelCanvases[canvasIndex];
    let ctx = canvas.getContext('2d');
    const fps = 30;
    const fadeFrames = (duration / 1000) * fps / 2;
    const pauseFrames = (pause_dur / 1000) * fps;
    const totalFrames = fadeFrames * 2 + pauseFrames;
    let currentFrame = 0;
    const colorValue = fadeColor === "black" ? "0, 0, 0" : "255, 255, 255";
    let switched = false;

    const updateFadeEffect = (frame) => {
        let opacity;
        if (frame < fadeFrames) {
            opacity = frame / fadeFrames;
        } else if (frame < fadeFrames + pauseFrames) {
            if (!switched) {
                switched = true;
                currentCamIndex = currentCamIndex === 0 ? 1 : 0;
                canvas = offPixelCanvases[currentCamIndex];
                ctx = canvas.getContext('2d');
            }
            opacity = 1;
        } else {
            opacity = 1 - ((frame - fadeFrames - pauseFrames) / fadeFrames);
        }
        return `rgba(${colorValue}, ${opacity})`;
    };

    const fadeStep = () => {
        if (currentFrame < totalFrames) {
            ctx.fillStyle = updateFadeEffect(currentFrame);
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const dataURL = canvas.toDataURL('image/png');
            updateCanvas('pixel-canvas', dataURL, canvasIndex);
            setDMXFromPixelCanvas(getPixelImageData(currentCamIndex), parseFloat(pixelSmoothPerson.value));
            currentFrame++;
            requestAnimationFrame(fadeStep);
        } else {
            fadingBlack = false;
        }
    };
    fadeStep();
}

let isBlack = false;
function fadeCanvasToBlack(canvasIndex, duration = fade_dur, callback) {
    if (isBlack) return;
    isBlack = true;
    const canvas = offPixelCanvases[canvasIndex];
    const ctx = canvas.getContext('2d');
    const fps = 30;
    const totalFrames = (duration / 1000) * fps;
    let currentFrame = 0;
    const increment = 1 / totalFrames;
    const colorValue = fadeColor === "black" ? "0, 0, 0" : "255, 255, 255";
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const fadeStep = () => {
        if (currentFrame <= totalFrames) {
            let opacity = increment * currentFrame;
            ctx.putImageData(imageData, 0, 0);

            ctx.fillStyle = `rgba(${colorValue}, ${opacity})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const croppedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const dataURL = canvas.toDataURL('image/png');
            updateCanvas('pixel-canvas', dataURL, canvasIndex);
            setDMXFromPixelCanvas(getPixelImageData(currentCamIndex), parseFloat(pixelSmoothPerson.value));

            if (opacity < 1) {
                currentFrame++;
                requestAnimationFrame(fadeStep);
            } else {
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        }
    };

    fadeStep();
}

document.addEventListener('DOMContentLoaded', () => {
    const fadeColourSelect = document.getElementById('fadeColour');
    function updateFadeColorFromSelect() {
        const fadeColourSelect = document.getElementById('fadeColour');
        fadeColor = fadeColourSelect.value;
        console.log(fadeColor);
    }
    updateFadeColorFromSelect();
    fadeColourSelect.addEventListener('change', updateFadeColorFromSelect);
});

export const updateFadeDuration = () => {
    const fadeDurInput = document.getElementById('fadeDur');
    fade_dur = parseInt(fadeDurInput.value, 10);
};

export const updateSwitchDuration = () => {
    const switchDurInput = document.getElementById('switchDur');
    switch_dur = parseInt(switchDurInput.value, 10) * 1000;
};

export const updatePauseDuration = () => {
    const pauseDurInput = document.getElementById('pauseDur');
    pause_dur = parseInt(pauseDurInput.value, 10) * 1000;
};
