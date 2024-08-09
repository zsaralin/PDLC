// cameraSetup.js

import { detectVideo } from "./index.js";
import { initOuterRoi } from "./drawing/outerRoi.js";
import { monitorBrightness } from './cameraFilters/autoExposure.js';
import { setupPause } from './UIElements/pauseButton.js';

export let numCameras;

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
        return null;
    }

    try {
        // Delay to ensure cameras are properly detected
        await new Promise(resolve => setTimeout(resolve, 3000));

        const devices = await navigator.mediaDevices.enumerateDevices();
        const targetCameras = devices.filter(device => device.kind === 'videoinput');
        console.log(targetCameras)
        numCameras = targetCameras.length;

        if (numCameras > 0) {
            // Map cameras to the correct video elements based on deviceId
            const cameraMapping = {
                'a1af57548bee0a5b0268a05de63e1a6cf3eb2c50049ba5a71d9b684be83a0e6a': video0,
                '5c8b5ebe5a7e2fe7b5ba220aac2292fd34a93b9ff50d3cca3495f31955d11a91': video1
            };

            const streamPromises = targetCameras.map(async (camera) => {
                const video = cameraMapping[camera.deviceId];
                if (video) {
                    await initializeVideoStream(camera.deviceId, video);
                }
            });

            await Promise.all(streamPromises);

            const videoElements = [video0, video1].filter(Boolean);
            const loadedPromises = videoElements.map(video => {
                return new Promise((resolve) => {
                    if (video.readyState >= 2) {
                        resolve(video);
                    } else {
                        video.onloadeddata = () => {
                            console.log('Video loaded');
                            resolve(video);
                        }
                    }
                });
            });
            await Promise.all(loadedPromises);
            console.log('All videos loaded');

            await initializeVideo(video0, video1, canvas0, canvas1, topCanvas0, topCanvas1);
        } else {
            console.log('No target cameras found');
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
    canvas0.width = video0.videoWidth;
    canvas0.height = video0.videoHeight;
    topCanvas0.width = video0.videoWidth;
    topCanvas0.height = video0.videoHeight;

    video0.play();
    // Assuming these functions are imported or defined elsewhere
    initOuterRoi(video0);
    monitorBrightness(video0, 0);

    if (numCameras > 1) {
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
