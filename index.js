import {clearCanvas, drawFaces} from './drawing/drawFaces.js'
import {processDetection} from "./faceDetection/processDetection.js";
import {setupSidePanel} from "./UIElements/sidePanel.js";
import {changeOrientation} from "./UIElements/videoOrientation.js";
import {monitorBrightness} from './cameraFilters/autoExposure.js'
import {drawOuterRoi, initOuterRoi, copyVideoToCanvas} from "./drawing/outerRoi.js";
import {drawDMXTest} from "./dmx/screensaverModes.js";
import {setupFaceAPI} from './faceDetection/faceDetection.js';
import {calculateFPS} from './UIElements/fps.js';
import {setupPause} from './UIElements/pauseButton.js';
import {setCam0, setCam1, preDMX, currentCamIndex} from './dmx/preDMX.js'
import {createPoseDetector, getPoseDetection} from './faceDetection/poseDetection.js';
import {predictWebcamB} from './drawing/bodyTracking.js';
import {faceInFrame} from './faceDetection/poseDetectionChecks.js';
import {angle} from './UIElements/videoOrientation.js';
import {fadeToScreensaver, isScreensaver, fadeToFace} from './dmx/fadeToScreensaver.js';
import {setScreensaverStatus} from './dmx/fadeToScreensaver.js';
import {createBackgroundSegmenter} from "./faceDetection/backgroundSegmenter.js";
import {drawSegmentation, getSegmentation, initBgSegmenters} from "./drawing/drawSegmentation.js";
import {appVersion} from "./UIElements/appVersionHandler.js";
import {clearFilterCnv, getFilterCtx} from "./drawing/drawROI.js";
import {updatePixelatedCanvas} from "./drawing/pixelCanvasUtils.js";

let currentFaces0 = null; // Global variable to hold the latest face detection results
let currentFaces1 = null;

let ctx0;
let ctx1;
let topCtx0;
let topCtx1;

const canvasWithOuterROI0 = document.createElement('canvas');
const ctxWithOuterROI0 = canvasWithOuterROI0.getContext('2d');

const canvasWithOuterROI1 = document.createElement('canvas');
const ctxWithOuterROI1 = canvasWithOuterROI1.getContext('2d');

let faceDetector0;
let faceDetector1;
let poseDetector0;
let poseDetector1;

let video0;
let video1;
let canvas0;
let canvas1;
let topCanvas0;
let topCanvas1;
let numCameras;

const screensaverMode = document.getElementById('screensaver');
let screensaverInterval;
const gaussianBlur = document.getElementById('gaussianBlur');

async function getCameraNativeResolution(deviceId) {
    const constraints = {
        video: { deviceId: { exact: deviceId } },
        audio: false
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();

        // Stop the stream as we only need the settings
        track.stop();

        return {
            width: settings.width,
            height: settings.height
        };
    } catch (error) {
        console.error('Error accessing the camera: ', error);
        return null;
    }
}

export async function detectVideo() {
    if (screensaverMode.checked) {
        drawDMXTest()
        requestAnimationFrame(() => detectVideo());
        return
    }
    if ((numCameras === 1 && (!video0 || video0.paused))
        || (numCameras === 2 && (!video0 || video0.paused || !video1 || video1.paused))) return Promise.resolve(false);
    calculateFPS(0)
    // const detections0 =  faceDetector0.detectForVideo(processingCanvas0, startTimeMs).detections
    copyVideoToCanvas(ctxWithOuterROI0, video0, canvas0, 0)
    // const rotatedCanvas = rotateCanvas(canvasWithOuterROI0)
    const poseDetections0 = appVersion.value === 'skeleton' ? await getSegmentation(canvasWithOuterROI0, 0) : await getPoseDetection(canvasWithOuterROI0, 0);
    // console.log(poseDetections0[0])
    currentFaces0 = processDetection(poseDetections0, 0);

    // await drawSegmentation()
    if (numCameras === 2) {
        calculateFPS(1)
        document.getElementById('video-container2').style.display = "block"
        // const detections1 =  faceDetector1.detectForVideo(processingCanvas1, startTimeMs).detections
        copyVideoToCanvas(ctxWithOuterROI1, video1, canvas1, 1);
        const poseDetections1 = appVersion.value === 'skeleton' ? await getSegmentation(canvasWithOuterROI1, 1) : await getPoseDetection(canvasWithOuterROI1, 1)

        currentFaces1 = processDetection(poseDetections1, 1);
    }
    clearFilterCnv()
    if (currentFaces0) {
        ctx0.clearRect(0, 0, canvas0.width, canvas0.height);
        topCtx0.clearRect(0, 0, canvas0.width, canvas0.height);
        predictWebcamB(video0, 0, canvas0, ctx0, currentFaces0)
        setCam0(true);
    } else {
        ctx0.clearRect(0, 0, canvas0.width, canvas0.height);
        topCtx0.clearRect(0, 0, canvas0.width, canvas0.height);
        predictWebcamB(video0, 0, canvas0, ctx0, currentFaces0)
        setCam0(false);
    }

    if (currentFaces1) {
        ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
        topCtx1.clearRect(0, 0, canvas1.width, canvas1.height);
        predictWebcamB(video1, 1, canvas1, ctx1, currentFaces1)
        setCam1(true);
    } else {
        ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
        topCtx1.clearRect(0, 0, canvas1.width, canvas1.height);
        setCam1(false);
    }
    const filterCtx = getFilterCtx()
    filterCtx.filter = `blur(${gaussianBlur.value}px)`;

    // updatePixelatedCanvas(fcanv, fctx, 0);
preDMX(currentFaces0, currentFaces1, canvas0, ctx0)
requestAnimationFrame(() => detectVideo());
}

async function setupCamera() {
    if (!navigator.mediaDevices) {
        return null;
    }

    try {

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        console.log(videoInputs)
        const targetCameras = findTargetCameras(videoInputs); // Assuming findTargetCameras returns an array or false
        numCameras = targetCameras.length
        if (targetCameras) {
            const [camera1, camera2] = targetCameras;

            const resolution1 = await getCameraNativeResolution(camera1.deviceId);
            const resolution2 = await getCameraNativeResolution(camera2.deviceId);

            console.log(resolution1)
            const videoElements = numCameras === 1 ? [video0] : [video0, video1]; // Ensure video0 and video1 are defined and accessible here
            const streamPromises = targetCameras.map(async (camera, index) => {
                const video = videoElements[index]; // Select the corresponding video element
                console.log(camera.deviceId)
                await initializeVideoStream(camera.deviceId, video);

            });

            await Promise.all(streamPromises);

            // Create promises that resolve when each video's `loadeddata` event fires
            const loadedPromises = videoElements.map(video => {
                return new Promise((resolve) => {
                    // console.log(video.readyState)
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
            console.log('No target cameras found or targetCamera is false');
            return null;
        }
    } catch (err) {
        handleCameraError(err);
        return null;
    }
}

function findTargetCameras(videoInputs) {
    console.log('finding target caameras')
    // const usbCameras = videoInputs.filter(device => device.label.includes('Usb'));
    console.log(videoInputs)
    return videoInputs
}

async function initializeVideoStream(deviceId, video) {
    const constraints = {
        video: {
            audio: false, deviceId: {exact: deviceId},
            width: { exact: 640 /2},  // Exact width
            height: { exact: 480/2 }, // Exact height to maintain aspect ratio 16:9
        }
    };
    video.srcObject = await navigator.mediaDevices.getUserMedia(constraints);
}

function handleCameraError(err) {
    if (err.name === 'PermissionDeniedError' || err.name === 'NotAllowedError') {
        console.log(`Camera Error: camera permission denied: ${err.message || err}`);
    }
    if (err.name === 'SourceUnavailableError') {
        console.log(`Camera Error: camera not available: ${err.message || err}`);
    }
}

async function initializeVideo(video) {
    setupSidePanel()

    canvas0.width = video0.videoWidth;
    canvas0.height = video0.videoHeight;
    topCanvas0.width = video0.videoWidth;
    topCanvas0.height = video0.videoHeight;

    canvasWithOuterROI0.width = video0.videoWidth;
    canvasWithOuterROI0.height = video0.videoHeight;
    video0.play();
    initOuterRoi(video0);
    monitorBrightness(video0, 0);
    // await startBodySegmenter(video0, canvas0, 0);
    if (numCameras > 1) {
        canvas1.width = video1.videoWidth;
        canvas1.height = video1.videoHeight;
        topCanvas1.width = video1.videoWidth;
        topCanvas1.height = video1.videoHeight;

        canvasWithOuterROI1.width = video1.videoWidth;
        canvasWithOuterROI1.height = video1.videoHeight;
        video1.play();
        initOuterRoi(video1);
        monitorBrightness(video1, 1);
        // await startBodySegmenter(video1, canvas1, 1);

    }

    setupPause(video0, video1);
    changeOrientation(0);
    await detectVideo();
}


async function main() {
    const videos = document.querySelectorAll('.video-container .video');
    const canvases = document.querySelectorAll('.video-container .canvas');
    const topCanvases = document.querySelectorAll('.video-container .top-canvas');

    video0 = videos[0]; // First video element
    video1 = videos[1]; // Second video element
    canvas0 = canvases[0]; // First canvas element
    canvas1 = canvases[1]; // Second canvas element
    topCanvas0 = topCanvases[0];
    topCanvas1 = topCanvases[1];

    ctx0 = canvas0.getContext('2d', {willReadFrequently: true});
    ctx1 = canvas1.getContext('2d', {willReadFrequently: true});
    topCtx0 = topCanvas0.getContext('2d', {willReadFrequently: true});
    topCtx1 = topCanvas1.getContext('2d', {willReadFrequently: true});

    // ctx0.lineWidth = 3;
    // ctx0.strokeStyle = 'white';
    // ctx0.fillStyle = 'white';
    // ctx0.globalAlpha = 0.9;

    // ctx1.lineWidth = 3;
    // ctx1.strokeStyle = 'white';
    // ctx1.fillStyle = 'white';
    // ctx1.globalAlpha = 0.9;
    // [poseDetector0, poseDetector1] = await createPoseDetector();
    // await initBgSegmenters()
    await setupCamera();
}

window.onload = main;
