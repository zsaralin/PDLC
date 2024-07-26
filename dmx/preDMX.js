import { setDMXFromPixelCanvas } from "./sendDMX.js";
import { getPixelImageData } from "../drawing/pixelCanvasUtils.js";
import {drawDMXTest} from "./screensaverModes.js";

let cam0 = false;
let cam1 = false;

export async function preDMX() {
    const pixelSmoothPerson = document.getElementById('pixelSmoothPerson');

    const pixelSmoothValue = parseFloat(pixelSmoothPerson.value);

    if (cam0 || cam1) {
        isScreensaver = false;
        setDMXFromPixelCanvas(getPixelImageData(0), pixelSmoothValue);
    } else {
        if (!isScreensaver && !isAnim) {
            isAnim = true;
            fadeToBlack();
        }
        requestAnimationFrame(drawDMXTest);
    }
}

export function setCam0(status) {
    cam0 = status;
}

export function setCam1(status) {
    cam1 = status;
}


let isScreensaver = false;
let isAnim = false;

const blackScreenDuration = 1000; // Duration for how long the screen fades to black in milliseconds

function fadeToBlack() {
    const black = document.getElementById('blackScreen');
    black.checked = true;
    setTimeout(() => {
        black.checked = false;
        isScreensaver = true;
        isAnim = false;
    }, blackScreenDuration);
}
