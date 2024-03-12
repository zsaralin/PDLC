import {ImageSegmenter, FilesetResolver,} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

let imageSegmenters = [];
let canvases = [];
let ctxs = [];

export let bgSeg = true;

export function toggleBgSeg(){
    bgSeg = !bgSeg;
}

export async function startImageSegmenter(video, canvasI, i) {
    canvases[i] = canvasI;
    ctxs[i] = canvases[i].getContext('2d', {willReadFrequently: true});
    imageSegmenters[i] = await createImageSegmenter()
}

const createImageSegmenter = async () => {
    try {
        const audio = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm"
        );

        return await ImageSegmenter.createFromOptions(audio, {
            baseOptions: {
                modelAssetPath:
                    "https://storage.googleapis.com/mediapipe-models/image_segmenter/deeplab_v3/float32/1/deeplab_v3.tflite",
                delegate: "GPU"
            },
            runningMode: 'VIDEO',
            outputCategoryMask: true,
            outputConfidenceMasks: false
        });
    } catch (error) {
        console.error('Error creating ImageSegmenter:', error);
        throw error; // Rethrow or handle as needed
    }
};

let lastWebcamTimes = [-1,-1];
export async function predictWebcam(video, i) {
    if(!video || video.paused) return;

    lastWebcamTimes[i] = video.currentTime;

    // Use the corresponding context and video size
    ctxs[i].drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    if (imageSegmenters[i] === undefined) {
        return;
    }
    let startTimeMs = performance.now();

    // Start segmenting the stream and pass the index to the callback
    imageSegmenters[i].segmentForVideo(video, startTimeMs, (result) => callbackForVideo(result, video, i));
}
const bg = document.getElementById('bg');
function callbackForVideo(result, video, i) {
    // Draw the video frame to the corresponding canvas
    ctxs[i].drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    // Get the image data from the corresponding canvas
    let imageData = ctxs[i].getImageData(0, 0, video.videoWidth, video.videoHeight);
    let data = imageData.data;

    // Prepare the canvas for drawing the darkened layer or the selected fill style
    if(bg.value < 0){
        ctxs[i].fillStyle = `rgba(255, 255, 255, ${-bg.value})`;
    } else{
        ctxs[i].fillStyle = `rgba(0, 0, 0, ${bg.value})`;
    }

    // Fill the canvas
    ctxs[i].fillRect(0, 0, video.videoWidth, video.videoHeight);

    // Retrieve the modified image data
    let darkenedData = ctxs[i].getImageData(0, 0, video.videoWidth, video.videoHeight).data;

    // Process the mask and apply it to the darkenedData
    const mask = result.categoryMask.getAsFloat32Array();
    let j = 0;
    for (let i = 0; i < mask.length; ++i) {
        if (mask[i] !== 0) {
            darkenedData[j] = data[j];
            darkenedData[j + 1] = data[j + 1];
            darkenedData[j + 2] = data[j + 2];
            darkenedData[j + 3] = data[j + 3];
        }
        j += 4;
    }

    // Put the processed image data back on the canvas
    ctxs[i].putImageData(new ImageData(darkenedData, video.videoWidth, video.videoHeight), 0, 0);
}