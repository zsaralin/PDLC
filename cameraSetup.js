// cameraSetup.js

import { detectVideo } from "./index.js";
import { initOuterRoi } from "./drawing/outerRoi.js";
import { monitorBrightness } from './cameraFilters/autoExposure.js';
import { setupPause } from './UIElements/pauseButton.js';

export let numCameras;

// Flag to determine whether to use camera mapping or auto-detect the first two cameras
const useCameraMapping = false;  // Set to false to auto-detect

async function getCameraNativeResolution(deviceId) {
    const constraints = {
        video: { deviceId: { exact: deviceId } },
        audio: false
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
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

export async function setupCamera(video0, video1, canvas0, canvas1, topCanvas0, topCanvas1) {
    if (!navigator.mediaDevices) {
        console.error('Media devices are not supported in this environment.');
        return null;
    }

    try {
        // Delay to ensure cameras are properly detected
        await new Promise(resolve => setTimeout(resolve, 3000));

        const devices = await navigator.mediaDevices.enumerateDevices();
        const targetCameras = devices.filter(device => device.kind === 'videoinput');
        console.log(targetCameras);
        numCameras = targetCameras.length;

        if (numCameras === 0) {
            console.log('No cameras detected.');
            await initializeVideo(video0, video1, canvas0, canvas1, topCanvas0, topCanvas1);
            return null;
        }

        const streamPromises = [];

        if (useCameraMapping) {
            // Map cameras to the correct video elements based on deviceId
            const cameraMapping = {
                '60ceb034f61b14c0a24c201476e8e0ac960d276c46832afea219866a970c821d': video0,
                '77abb17f3725d1de6f7df1f52168ce29c4d6ae2108eb0e88623a3f287d6cc058': video1
            };

            targetCameras.forEach((camera) => {
                const video = cameraMapping[camera.deviceId];
                if (video) {
                    streamPromises.push(initializeVideoStream(camera.deviceId, video));
                }
            });
        } else {
            // Automatically grab the first detected camera(s)
            if (targetCameras[0]) {
                streamPromises.push(initializeVideoStream(targetCameras[0].deviceId, video0));
            }
            if (targetCameras[1]) {
                streamPromises.push(initializeVideoStream(targetCameras[1].deviceId, video1));
            }
        }

        await Promise.all(streamPromises);

        // Dynamically create an array of video elements based on how many cameras were detected
        const videoElements = [];
        if (numCameras >= 1 && video0) videoElements.push(video0);
        if (numCameras >= 2 && video1) videoElements.push(video1);

        if (videoElements.length === 0) {
            console.error('No video elements to initialize.');
            return null;
        }

        const loadedPromises = videoElements.map(video => {
            return new Promise((resolve, reject) => {
                video.onloadeddata = () => {
                    console.log('Video loaded');
                    resolve(video);
                };
                video.onerror = () => {
                    console.error('Video failed to load');
                    reject('Video load failed');
                };
                setTimeout(() => {
                    reject('Video load timeout');
                }, 5000); // Timeout after 5 seconds
            });
        });

        // Try to resolve all loadedPromises
        try {
            await Promise.all(loadedPromises);
            console.log('All videos loaded successfully');
            await initializeVideo(video0, video1, canvas0, canvas1, topCanvas0, topCanvas1);
        } catch (error) {
            console.error('Error during video loading or playing:', error);
            return null;
        }

    } catch (err) {
        handleCameraError(err);
        return null;
    }
}

async function initializeVideoStream(deviceId, video) {
    const constraints = {
        video: {
            audio: false,
            deviceId: { exact: deviceId },
            width: { ideal: 640 / 2 },
            height: { ideal: 360 / 2 },
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

async function initializeVideo(video0, video1, canvas0, canvas1, topCanvas0, topCanvas1) {
    if (video0) {
        canvas0.width = video0.videoWidth;
        canvas0.height = video0.videoHeight;
        topCanvas0.width = video0.videoWidth;
        topCanvas0.height = video0.videoHeight;

        video0.play();
        initOuterRoi(video0);
        monitorBrightness(video0, 0);
    }

    if (numCameras > 1 && video1) {
        canvas1.width = video1.videoWidth;
        canvas1.height = video1.videoHeight;
        topCanvas1.width = video1.videoWidth;
        topCanvas1.height = video1.videoHeight;

        video1.play();
        initOuterRoi(video1);
        monitorBrightness(video1, 1);
    }

    setupPause(video0, video1);
    await detectVideo();
}
