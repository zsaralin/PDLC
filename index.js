import {clearCanvas, drawFaces} from './drawing/drawFaces.js'
import {processDetection} from "./newFaces.js";
import {log} from "./overlay.js";
import {setupSidePanel} from "./UIElements/sidePanel.js";
import {changeOrientation} from "./videoOrientation.js";
import {monitorBrightness} from './cameraFilters/autoExposure.js'
import {drawOuterRoi, initOuterRoi, processVideoFrame} from "./drawing/outerRoi.js";
import {predictWebcam, startImageSegmenter, bgSeg} from "./drawing/bgSeg.js";
import {drawDMXTest} from "./dmx/dmxTests.js";
import { setupFaceAPI } from './faceapi.js';
import { calculateFPS } from './UIElements/fps.js';
import { setupPause } from './UIElements/pauseButton.js';

let currentFaces = null; // Global variable to hold the latest face detection results
let canvas;
let ctx;
const processingCanvas = document.createElement('canvas');
const processingCtx = processingCanvas.getContext('2d');

let faceDetector; 
let video;

export function detectVideo() {
    if (!video || video.paused) return Promise.resolve(false);
    calculateFPS()
    let startTimeMs = performance.now();
    const detections =  faceDetector.detectForVideo(processingCanvas, startTimeMs).detections
    currentFaces = processDetection(detections);
    processVideoFrame(processingCtx, video, canvas)
    if (currentFaces) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if(bgSeg) predictWebcam(video)
        drawOuterRoi(canvas)
        drawFaces(ctx, currentFaces, video);
    } else {
        // clearCanvas(canvas)
    }
    requestAnimationFrame(() => detectVideo());
}
async function setupCamera() {
    log('Setting up camera');
    
    if (!navigator.mediaDevices) {
        log('Camera Error: access not supported');
        return null;
    }
    
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        const targetCamera = findTargetCamera(videoInputs);
        
        if (targetCamera) {
            await initializeVideoStream(targetCamera.deviceId);
            return new Promise((resolve) => {
                if (video.readyState >= 2) {
                    initializeVideo();
                    resolve(true);
                } else {
                    video.onloadeddata = async () => {
                        await initializeVideo();
                        resolve(true);
                    };
                }
            });
        }
    } catch (err) {
        handleCameraError(err);
        return null;
    }
}

function findTargetCamera(videoInputs) {
    return videoInputs.find(device => device.label.includes('Usb'));
}

async function initializeVideoStream(deviceId) {
    const constraints = {
        video: { audio: false, deviceId: { exact: deviceId }, width: 640 }
    };
    video.srcObject = await navigator.mediaDevices.getUserMedia(constraints);
}

function handleCameraError(err) {
    if (err.name === 'PermissionDeniedError' || err.name === 'NotAllowedError') {
        log(`Camera Error: camera permission denied: ${err.message || err}`);
    }
    if (err.name === 'SourceUnavailableError') {
        log(`Camera Error: camera not available: ${err.message || err}`);
    }
}

async function initializeVideo() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    processingCanvas.width = video.videoWidth;
    processingCanvas.height = video.videoHeight;
    video.play();
    changeOrientation(0);
    initOuterRoi(video);
    // monitorBrightness(video);
    setupPause(video);
    setupSidePanel();
    await startImageSegmenter(video, canvas);
    // await detectVideo();
    setInterval(drawDMXTest, 200)
    // drawDMXTest; // 5000 milliseconds = 5 seconds

}

async function main() {
    log('PDLC');
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d', {willReadFrequently: true});
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    ctx.globalAlpha = 0.9;

    faceDetector = await setupFaceAPI();
    await setupCamera();
    document.getElementById('overlay').style.display = 'none'
}

// start processing as soon as page is loaded
window.onload = main;
