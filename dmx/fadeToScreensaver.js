import { drawDMXTest, getScreensaverCanvas } from "./screensaverModes.js";
import { currentCamIndex, getPixelCanvases } from "./preDMX.js";
import { setDMXFromPixelCanvas } from "./dmx.js";
import { getPixelImageData } from "../drawing/pixelCanvasUtils.js";
import { resetGradientSweep } from "./screensaverModes.js";
import { fadeToFaceFromBlack } from "../drawing/bodyTracking.js";
import { fade_dur } from "./preDMX.js";

export let isScreensaver = false; 
let isFading = false; 

export function fadeToScreensaver() {
    const offPixelCanvases = getPixelCanvases();
    const canvas = offPixelCanvases[currentCamIndex];

    // if (!isScreensaver && !isFading) {
    //     console.log('sending screensaver ds')
    //     isFading = true;
    //     setTimeout(() => {
    //         isScreensaver = true;
    //         isFading = false;
    //         resetGradientSweep()
    //     }, fade_dur);
    // } else if (isScreensaver && !isFading){
    isScreensaver = true;
    requestAnimationFrame(drawDMXTest);

    // drawDMXTest()
}
export function fadeToFace() {
    const canvas = getScreensaverCanvas()
    if (isScreensaver && !isFading) {
        isFading = true; 
        startFade(canvas); 
        setTimeout(() => {
            isScreensaver = false; 
            isFading = false; 
            fadeToFaceFromBlack()
        }, fade_dur); 
    }
}

export function setScreensaverStatus(i){
    if(!isFading){
        isScreensaver = i
    } 
}


function startFade(canvas) {
    const ctx = canvas.getContext('2d');
    const fps = 30;  // Suitable frame rate for smooth animation
    const totalFrames = (fade_dur / 1000) * fps; // Calculate total frames
    let currentFrame = 0;
    const increment = 1 / totalFrames; // Opacity increment per frame
    // Capture the initial state of the canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    console.log('before')
    const fadeStep = () => {

        if (currentFrame <= totalFrames) {
            let opacity = increment * currentFrame;
            ctx.putImageData(imageData, 0, 0);
            ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const newImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            setDMXFromPixelCanvas(newImageData);
            if (opacity < 1) {
                currentFrame++;
                requestAnimationFrame(fadeStep);
            } else {
                ctx.clearRect(0,0,canvas.width, canvas.height)
                console.log('Fade completed');
            }
        }
    };
    fadeStep();
}