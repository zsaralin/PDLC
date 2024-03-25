import { clearCanvas, drawFaces } from './drawing/drawFaces.js'
import { processDetection } from "./newFaces.js";
import { log } from "./overlay.js";
import { setupSidePanel } from "./UIElements/sidePanel.js";
import { changeOrientation, rotateCanvas } from "./UIElements/videoOrientation.js";
import { monitorBrightness } from './cameraFilters/autoExposure.js'
import { drawOuterRoi, initOuterRoi, copyVideoToCanvas } from "./drawing/outerRoi.js";
import { predictWebcam, startImageSegmenter, bgSeg } from "./drawing/bgSeg.js";
import { drawDMXTest } from "./dmx/dmxTests.js";
import { setupFaceAPI } from './faceapi.js';
import { calculateFPS } from './UIElements/fps.js';
import { setupPause } from './UIElements/pauseButton.js';
import { setCam0, setCam1, preDMX } from './twoCam.js'
import { createPoseDetector } from './poseDetection.js';
import { startBodySegmenter, predictWebcamB } from './drawing/selfieSegmenter.js';
import { faceInFrame } from './poseDetectionChecks.js';
import { adjustPersonKeypoints } from './drawing/adjustedKeypoints.js';
import { angle } from './UIElements/videoOrientation.js';
let currentFaces0 = null; // Global variable to hold the latest face detection results
let currentFaces1 = null;

let ctx0; let ctx1;
const canvasWithOuterROI0 = document.createElement('canvas');

const ctxWithOuterROI0 = canvasWithOuterROI0.getContext('2d');

const canvasWithOuterROI1 = document.createElement('canvas');
const ctxWithOuterROI1 = canvasWithOuterROI1.getContext('2d');

let faceDetector0; let faceDetector1;
let poseDetector0; let poseDetector1;
let video0; let video1;
let canvas0; let canvas1;
let numCameras;

export async function detectVideo() {
    if ((numCameras === 1 && (!video0 || video0.paused))
        || (numCameras === 2 && (!video0 || video0.paused || !video1 || video1.paused))) return Promise.resolve(false);
    calculateFPS(0)
    let startTimeMs = performance.now();
    // const detections0 =  faceDetector0.detectForVideo(processingCanvas0, startTimeMs).detections
    copyVideoToCanvas(ctxWithOuterROI0, video0, canvas0)
    // const rotatedCanvas = rotateCanvas(canvasWithOuterROI0)
    const poseDetections0 = await poseDetector0.estimatePoses(canvasWithOuterROI0);
    currentFaces0 = processDetection(poseDetections0, 0);
    if (numCameras === 2) {
        calculateFPS(1)
        // const detections1 =  faceDetector1.detectForVideo(processingCanvas1, startTimeMs).detections
    
        copyVideoToCanvas(ctxWithOuterROI1, video1, canvas1);
        const poseDetections1 = await poseDetector1.estimatePoses(canvasWithOuterROI1)
        currentFaces1 = processDetection(poseDetections1, 1);
    }
    if (currentFaces0 ) {
        ctx0.clearRect(0, 0, canvas0.width, canvas0.height && faceInFrame(currentFaces1, video0.videoHeight));
        predictWebcamB(video0, 0, canvas0, ctx0, currentFaces0, bgSeg)
        setCam0(true);
    } else {
        ctx0.clearRect(0, 0, canvas0.width, canvas0.height);
        setCam0(false);
    } if (currentFaces1 ) {
        ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
        predictWebcamB(video1, 1, canvas1, ctx1, currentFaces1, bgSeg)
        setCam1(true);
    } else {
        ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
        setCam1(false);
    }
    preDMX()
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
        numCameras = targetCameras.length

        if (targetCameras) {
            const videoElements = numCameras === 1 ? [video0] : [video0, video1]; // Ensure video0 and video1 are defined and accessible here
            const streamPromises = targetCameras.map(async (camera, index) => {
                const video = videoElements[index]; // Select the corresponding video element
                await initializeVideoStream(camera.deviceId, video);
            });

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
            await Promise.all(loadedPromises);
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
    // const usbCameras = videoInputs.filter(device => device.label.includes('Usb'));
    const usbCameras = videoInputs.slice(0, 1);
    return usbCameras;
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
    canvasWithOuterROI0.width = video0.videoWidth;
    canvasWithOuterROI0.height = video0.videoHeight;
    video0.play();
    initOuterRoi(video0);
    monitorBrightness(video0, 0);
    await startImageSegmenter(video0, canvas0, 0);
    await startBodySegmenter(video0, canvas0, 0);
    if (numCameras > 1) {
        canvas1.width = video1.videoWidth;
        canvas1.height = video1.videoHeight;
        canvasWithOuterROI1.width = video1.videoWidth;
        canvasWithOuterROI1.height = video1.videoHeight;
        video1.play();
        initOuterRoi(video1);
        // monitorBrightness(video1, 1);
        await startImageSegmenter(video1, canvas1, 1);
        await startBodySegmenter(video1, canvas1, 1);

    }

    setupPause(video0, video1);
    changeOrientation(0);
    setupSidePanel()
    await detectVideo();
    // setInterval(drawDMXTest, 100)
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
    ctx0 = canvas0.getContext('2d', { willReadFrequently: true });
    ctx1 = canvas1.getContext('2d', { willReadFrequently: true });

    ctx0.lineWidth = 3;
    ctx0.strokeStyle = 'white';
    ctx0.fillStyle = 'white';
    ctx0.globalAlpha = 0.9;

    ctx1.lineWidth = 3;
    ctx1.strokeStyle = 'white';
    ctx1.fillStyle = 'white';
    ctx1.globalAlpha = 0.9;

    // [faceDetector0, faceDetector1] = await setupFaceAPI();
    [poseDetector0, poseDetector1] = await createPoseDetector()
    await setupCamera();
    document.getElementById('overlay').style.display = 'none'
}

window.onload = main;
