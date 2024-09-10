
import { processDetection } from "./detection/processDetection.js";
import { setupSidePanel } from "./UIElements/sidePanel.js";
import { copyVideoToCanvas } from "./drawing/outerRoi.js";
import { drawDMXTest } from "./dmx/screensaverModes.js";
import { calculateFPS } from './UIElements/fps.js';
import { preDMX, setCam0, setCam1 } from './dmx/preDMX.js'
import { getSegmentation } from "./drawing/drawSegmentation.js";
import { drawBGOnFinalCanvas, processFrame } from "./drawing/processFrame.js";
import { setupVideoContainers } from "./components/VideoContainer.js";
import {numCameras, setupCamera} from './cameraSetup.js';

let currentFaces0 = null;
let currentFaces1 = null;

let ctx0, ctx1, topCtx0, topCtx1;
let video0, video1, canvas0, canvas1, topCanvas0, topCanvas1;

const canvasWithOuterROI0 = document.createElement('canvas');
const ctxWithOuterROI0 = canvasWithOuterROI0.getContext('2d');

const canvasWithOuterROI1 = document.createElement('canvas');
const ctxWithOuterROI1 = canvasWithOuterROI1.getContext('2d');

export async function detectVideo() {
    const screensaverMode = document.getElementById('screensaver');

    if (screensaverMode.checked) {
        drawDMXTest()
        requestAnimationFrame(() => detectVideo());
        return
    }
    if ((numCameras === 1 && (!video0 || video0.paused))
        || (numCameras === 2 && (!video0 || video0.paused || !video1 || video1.paused))) return Promise.resolve(false);

    calculateFPS(0)
    copyVideoToCanvas(ctxWithOuterROI0, video0, canvas0, 0)
    const poseDetections0 = await getSegmentation(video0, 0)
    currentFaces0 = processDetection(poseDetections0, 0);

    if (numCameras === 2) {
        calculateFPS(1)
        document.getElementById('video-container2').style.display = "block"
        copyVideoToCanvas(ctxWithOuterROI1, video1, canvas1, 1);
        const poseDetections1 = await getSegmentation(canvasWithOuterROI1, 1)
        currentFaces1 = processDetection(poseDetections1, 1);
    }
    drawBGOnFinalCanvas()
    if (currentFaces0) {
        processFrame(video0, canvas0, ctx0, currentFaces0, 0)
        setCam0(true);
    } else {
        processFrame(video0, canvas0, ctx0, currentFaces0, 0)
        setCam0(false);
    }
    if (currentFaces1) {
        processFrame(video1, canvas1, ctx1, currentFaces1, 1)
        setCam1(true);
    } else {
        processFrame(video0, canvas0, ctx0, currentFaces0, 0)
        setCam1(false);
    }
    preDMX(currentFaces0, currentFaces1, canvas0, ctx0)
    requestAnimationFrame(() => detectVideo());
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    // await delay(15000)
    setupVideoContainers()
    setupSidePanel()

    const videos = document.querySelectorAll('.video-container .video');
    const canvases = document.querySelectorAll('.video-container .canvas');
    const topCanvases = document.querySelectorAll('.video-container .top-canvas');

    video0 = videos[0];
    video1 = videos[1];
    canvas0 = canvases[0];
    canvas1 = canvases[1];
    topCanvas0 = topCanvases[0];
    topCanvas1 = topCanvases[1];

    ctx0 = canvas0.getContext('2d', {willReadFrequently: true});
    ctx1 = canvas1.getContext('2d', {willReadFrequently: true});
    topCtx0 = topCanvas0.getContext('2d', {willReadFrequently: true});
    topCtx1 = topCanvas1.getContext('2d', {willReadFrequently: true});

    // await delay(3000);

    await setupCamera(video0, video1, canvas0, canvas1, topCanvas0, topCanvas1);
}


window.onload = main;