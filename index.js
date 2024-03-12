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

let currentFaces0 = null; // Global variable to hold the latest face detection results
let currentFaces1 = null; // Global variable to hold the latest face detection results
let ctx0; let ctx1;
const processingCanvas0 = document.createElement('canvas');
const processingCtx0 = processingCanvas0.getContext('2d');
const processingCanvas1 = document.createElement('canvas');
const processingCtx1 = processingCanvas1.getContext('2d');

let faceDetector0; let faceDetector1 
let video0; let video1;
let canvas0; let canvas1;

export function detectVideo() {
    if (!video0 || video0.paused || !video1 || video1.paused) return Promise.resolve(false);
    calculateFPS(0)
    calculateFPS(1)

    let startTimeMs = performance.now();
    const detections0 =  faceDetector0.detectForVideo(processingCanvas0, startTimeMs).detections
    const detections1 =  faceDetector1.detectForVideo(processingCanvas1, startTimeMs).detections
    currentFaces0 = processDetection(detections0);
    currentFaces1 = processDetection(detections1);
    processVideoFrame(processingCtx0, video0, canvas0)
    processVideoFrame(processingCtx1, video1, canvas1)

    if (currentFaces0) {
        ctx0.clearRect(0, 0, canvas0.width, canvas0.height);
        if(bgSeg) predictWebcam(video0, 0)
        drawOuterRoi(canvas0)
        drawFaces(canvas0, ctx0, currentFaces0, video0,0);
    } if (currentFaces1) {
        ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
        if(bgSeg) predictWebcam(video1, 1)
        drawOuterRoi(canvas1)
        drawFaces(canvas1, ctx1, currentFaces1, video1,1);
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
        const targetCameras = findTargetCameras(videoInputs); // Assuming findTargetCameras returns an array or false

        if (targetCameras && targetCameras.length) {
            const videoElements = [video0, video1]; // Ensure video0 and video1 are defined and accessible here
            const streamPromises = targetCameras.map(async (camera, index) => {
                const video = videoElements[index]; // Select the corresponding video element
                await initializeVideoStream(camera.deviceId, video);
            });
        
            // Wait for all streams to be initialized
            await Promise.all(streamPromises);
        
            // Create promises that resolve when each video's `loadeddata` event fires
            const loadedPromises = videoElements.map(video => {
                return new Promise((resolve) => {
                    console.log(video.readyState)
                    if (video.readyState >= 2) {
                        resolve(video);
                    } else {
                        video.onloadeddata = () => resolve(video);
                    }
                });
            });
        
            // Wait for both videos to be loaded
            await Promise.all(loadedPromises);
            // Now that both videos are loaded, call `initializeVideo` once
            initializeVideo();
        } else {
            log('No target cameras found or targetCamera is false');
            return null;
        }
    } catch (err) {
        handleCameraError(err);
        return null;
    }
}

function findTargetCameras(videoInputs) {
    const usbCameras = videoInputs.filter(device => device.label.includes('Usb'));
    if (usbCameras.length === 2) {
        return usbCameras; // Return the two USB cameras
    } else {
        return false; // Return false if there aren't exactly two
    }
}

async function initializeVideoStream(deviceId, video) {
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

async function initializeVideo(video) {
    canvas0.width = video0.videoWidth;
    canvas0.height = video0.videoHeight;
    canvas1.width = video1.videoWidth;
    canvas1.height = video1.videoHeight;

    processingCanvas0.width = video0.videoWidth;
    processingCanvas0.height = video0.videoHeight;
    processingCanvas1.width = video1.videoWidth;
    processingCanvas1.height = video1.videoHeight;
    video0.play();
    video1.play();

    changeOrientation(0);
    initOuterRoi(video0);
    initOuterRoi(video1);

    monitorBrightness(video0, 0);
    monitorBrightness(video1, 1);

    setupPause(video0, video1);

    setupSidePanel();
    await startImageSegmenter(video0, canvas0, 0);
    await startImageSegmenter(video1, canvas1, 1);

    await detectVideo();
    // setInterval(drawDMXTest, 25)
    // drawDMXTest; // 5000 milliseconds = 5 seconds

}

async function main() {
    log('PDLC');
    const videos = document.querySelectorAll('.video-container .video');
    const canvases = document.querySelectorAll('.video-container .canvas');

    video0 = videos[0]; // First video element
    video1 = videos[1]; // Second video element
    canvas0 = canvases[0]; // First canvas element
    canvas1 = canvases[1]; // Second canvas element
    ctx0 = canvas0.getContext('2d', {willReadFrequently: true});
    ctx1 = canvas1.getContext('2d', {willReadFrequently: true});
    
    ctx0.lineWidth = 3;
    ctx0.strokeStyle = 'white';
    ctx0.fillStyle = 'white';
    ctx0.globalAlpha = 0.9;

    ctx1.lineWidth = 3;
    ctx1.strokeStyle = 'white';
    ctx1.fillStyle = 'white';
    ctx1.globalAlpha = 0.9;

    [faceDetector0, faceDetector1] = await setupFaceAPI();
    await setupCamera();
    document.getElementById('overlay').style.display = 'none'
}

window.onload = main;
