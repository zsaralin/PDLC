/**
 * FaceAPI Demo for Browsers
 * Loaded via `webcam.html`
 */

import * as faceapi from './dist/face-api.esm.js'; // use when in dev mode
import {clearCanvas, drawFaces} from './drawFaces.js'
import {processDetection} from "./newFaces.js";
import {log} from "./overlay.js";
import {setupSidePanel} from "./sidePanel.js";
import {bgSeg, segmentPersons, startSegmentation, stopSegmentation} from "./filters/bgSeg.js";
import {changeOrientation} from "./videoOrientation.js";
import {sendTrack} from "./cameraFilters/exposure.js";
import {monitorBrightness} from './cameraFilters/autoExposure.js'
import {initOuterRoi, processVideoFrame} from "./outerRoi.js";
import {drawDMXTest} from "./dmxTests.js";
import {FaceDetector, FilesetResolver,} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";
import {predictWebcam, startImageSegmenter} from "./filters/bgSeg2.js";

// configuration options
const modelPath = './model/'; // path to model folder that will be loaded using http
// const modelPath = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'; // path to model folder that will be loaded using http
const minScore = 0.2; // minimum score
const maxResults = 5; // maximum number of results to return
let optionsTinyFaceDetector ;

let prevBgSeg = false;
let currentFaces = null; // Global variable to hold the latest face detection results

function detectVideo() {
    // const currVideo = bgSeg ? webcamCanvas : video
    // if (bgSeg !== prevBgSeg) {
    //     prevBgSeg = bgSeg;
    //     if (bgSeg) {
    //         startSegmentation()
    //         segmentPersons(model, video, webcamCanvas, webcamCanvasCtx, tempCanvas, tempCanvasCtx)
    //     } else {
    //         stopSegmentation()
    //         webcamCanvasCtx.clearRect(0, 0, webcamCanvas.width, webcamCanvas.height)
    //
    //     }
    // }
    if (!video || video.paused) return Promise.resolve(false);

    // Calculate FPS
    const currentTime = performance.now();
    const elapsedTime = currentTime - lastFrameTime;
    if (elapsedTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / elapsedTime);
        fpsDisplay.textContent = `Processing FPS: ${fps}`;
        frameCount = 0;
        lastFrameTime = currentTime;
    }
    frameCount++;
    let startTimeMs = performance.now();

    // await faceDetection.send({image: video})
    const detections =  faceDetector.detectForVideo(processingCanvas, startTimeMs).detections
    currentFaces = processDetection(detections);
    processVideoFrame(processingCtx, video, canvas)

    // let startTimeMs = performance.now();
    //
    // // await faceDetection.send({image: video})
    // const detections =  faceDetector.detectForVideo(processingCanvas, startTimeMs).detections
    // currentFaces = processDetection(detections);
    if (currentFaces) {
        // console.log('saw a face')
        const ctx = canvas.getContext('2d', {willReadFrequently: true});
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if(bgSeg) predictWebcam(video)
        drawFaces(canvas, currentFaces, video);

    } else {
        // clearCanvas(canvas)
    }
    requestAnimationFrame(() => detectVideo());
}
let webcamCanvas;
let webcamCanvasCtx;
let tempCanvas;
let tempCanvasCtx;
let canvas;
let track;


let lastFrameTime = performance.now();
let frameCount = 0;
let fpsDisplay = document.getElementById('fps-display');

// just initialize everything and call main function
async function setupCamera() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    webcamCanvas = document.getElementById("blackCanvas");
    webcamCanvasCtx = webcamCanvas.getContext('2d');

//In Memory Canvas used for model prediction
    tempCanvas = document.createElement('canvas');
    tempCanvasCtx = tempCanvas.getContext('2d');
    const playPauseButton = document.getElementById('playPauseButton');
    if (!video || !canvas || !playPauseButton) return null;

    log('Setting up camera');
    // setup webcam. note that navigator.mediaDevices requires that page is accessed via https
    if (!navigator.mediaDevices) {
        log('Camera Error: access not supported');
        return null;
    }
    let stream;
    // let track;
    const constraints = {audio: false, video: {facingMode: 'user'}};
    if (window.innerWidth > window.innerHeight) constraints.video.width = {ideal: window.innerWidth};
    else constraints.video.height = {ideal: window.innerHeight};
    // if (window.innerWidth > window.innerHeight) constraints.video.width = {ideal: window.innerWidth};
    // else constraints.video.height = {ideal: window.innerHeight};

    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints)
        // track = stream.getVideoTracks()[0];


    } catch (err) {
        if (err.name === 'PermissionDeniedError' || err.name === 'NotAllowedError') log(`Camera Error: camera permission denied: ${err.message || err}`);
        if (err.name === 'SourceUnavailableError') log(`Camera Error: camera not available: ${err.message || err}`);
        return null;
    }
    if (stream) {
        video.srcObject = stream;
        track = stream.getVideoTracks()[0];
        sendTrack(track)
        await track.applyConstraints({ exposureMode: 'continuous' })

        // video.style.width = '100%';  // Ensure the video takes up the full width of the container
        // video.style.height = '150%';
        // video.style.objectFit = 'cover';

    } else {
        log('Camera Error: stream empty');
        return null;
    }

    // const settings = track.getSettings();
    // if (settings.deviceId) delete settings.deviceId;
    // if (settings.groupId) delete settings.groupId;
    // if (settings.aspectRatio) settings.aspectRatio = Math.trunc(100 * settings.aspectRatio) / 100;
    log(`Camera active: ${track.label}`);
    // log(`Camera settings: ${str(settings)}`);

    playPauseButton.addEventListener('click', togglePlayPause);

    // Append the button to the body or any other container you prefer
    document.getElementById('video-container').appendChild(playPauseButton);

    function togglePlayPause() {
        if (video && video.readyState >= 2) {
            if (video.paused) {
                video.play();
                detectVideo(video, canvas);
            } else {
                video.pause();
            }
            updatePlayPauseButtonState();
        }
        log(`Camera state: ${video.paused ? 'paused' : 'playing'}`);
    }
let imageSegmenter;
    function updatePlayPauseButtonState() {
        const playIcon = document.getElementById('play-icon');
        const pauseIcon = document.getElementById('pause-icon');

        if (video.paused) {
            playIcon.style.display = 'flex';
            pauseIcon.style.display = 'none';
        } else {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'flex';
        }
    }
    return new Promise((resolve) => {
        // Check if the video is already in a state where it has data
        if (video.readyState >= 2) {
            initializeVideo();
            resolve(true);
        } else {
            video.onloadeddata = async () => {
                await initializeVideo();
                resolve(true);
            };
        }

        async function initializeVideo() {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            webcamCanvas.width = video.videoWidth;
            webcamCanvas.height = video.videoHeight;
            tempCanvas.width = video.videoWidth;
            tempCanvas.height = video.videoHeight;

            processingCanvas.width = video.videoWidth; // Ensure these match the video's dimensions
            processingCanvas.height = video.videoHeight;
            initOuterRoi(video);

            // setInterval(drawDMXTest, 500); // 5000 milliseconds = 5 seconds
            monitorBrightness(video, track);

            video.play();
            await startImageSegmenter(video, canvas);
            await detectVideo();

            updatePlayPauseButtonState();
            changeOrientation(0);
        }
    });
}
const processingCanvas = document.createElement('canvas');
const processingCtx = processingCanvas.getContext('2d');

let faceDetector; let runningMode;
async function setupFaceAPI() {
    await faceapi.nets.tinyFaceDetector.load(modelPath); // using ssdMobilenetv1
    // await faceapi.nets.ssdMobilenetv1.load(modelPath);
    // await faceapi.nets.ageGenderNet.load(modelPath);
    // await faceapi.nets.faceLandmark68Net.load(modelPath);
    // await faceapi.nets.faceRecognitionNet.load(modelPath);
    // await faceapi.nets.faceExpressionNet.load(modelPath);
    // optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({minConfidence: minScore, maxResults});
    await faceapi.loadFaceLandmarkTinyModel(modelPath)
    optionsTinyFaceDetector = new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: .1 });

    // faceDetection = new FaceDetection({locateFile: (file) => {
    //         return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
    //     }});
    // faceDetection.setOptions({
    //     model: 0,//'./model/blaze_face_short_range.tflite',
    //     minDetectionConfidence: 0.5
    // });
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    faceDetector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
            delegate: "GPU"
        },
        runningMode: 'VIDEO'
    });
    console.log(faceDetector)

    log(`Models loaded`);
}

async function main() {
    log('Level of Confidence');
    await faceapi.tf.setBackend('webgl');
    await faceapi.tf.ready();
    // tfjs optimizations
    if (faceapi.tf?.env().flagRegistry.CANVAS2D_WILL_READ_FREQUENTLY) faceapi.tf.env().set('CANVAS2D_WILL_READ_FREQUENTLY', true);
    if (faceapi.tf?.env().flagRegistry.WEBGL_EXP_CONV) faceapi.tf.env().set('WEBGL_EXP_CONV', true);
    if (faceapi.tf?.env().flagRegistry.WEBGL_EXP_CONV) faceapi.tf.env().set('WEBGL_EXP_CONV', true);


    await setupFaceAPI();
    await setupCamera();
    document.getElementById('overlay').style.display = 'none'
    setupSidePanel()
    // initSliderValues()

    // setTimeout(() => console.log("Delay finished"), 7000);

    // track.applyConstraints({  brightness: 128 });


}

let model;
let video;
// start processing as soon as page is loaded
window.onload = main;
