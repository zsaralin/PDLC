import {ImageSegmenter, FilesetResolver,} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

let imageSegmenter;
let canvas;
let ctx;

export async function startImageSegmenter(video, canvasI) {
    canvas = canvasI;
    ctx = canvas.getContext('2d', {willReadFrequently: true});
    imageSegmenter = await createImageSegmenter()
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

let lastWebcamTime = -1;

export async function predictWebcam(video) {
    if(!video || video.paused) return

    lastWebcamTime = video.currentTime;

    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    if (imageSegmenter === undefined) {
        return;
    }
    let startTimeMs = performance.now();

    // Start segmenting the stream.
    imageSegmenter.segmentForVideo(video, startTimeMs, (result) => callbackForVideo(result, video));
}
const bg = document.getElementById('bg');

function callbackForVideo(result, video) {
// First, draw the video frame to the canvas to capture the current image
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    // Get the current image data from the canvas
    let imageData = ctx.getImageData(0, 0, video.videoWidth, video.videoHeight);
    let data = imageData.data; // Direct reference to the pixel data

    if(bg.value<0){
        ctx.fillStyle = `rgba(255, 255, 255, ${-bg.value})`;
    } else{
        ctx.fillStyle = `rgba(0, 0, 0, ${bg.value})`;
    }
    // Fill the entire canvas with a semi-transparent dark color
    ctx.fillRect(0, 0, video.videoWidth, video.videoHeight);

    // Retrieve the modified image data
    let darkenedData = ctx.getImageData(0, 0, video.videoWidth, video.videoHeight).data;

    // The mask from the segmentation result
    const mask = result.categoryMask.getAsFloat32Array();
    let j = 0;
    for (let i = 0; i < mask.length; ++i) {
        if (mask[i] !== 0) {
            darkenedData[j] = data[j];
            darkenedData[j + 1] = data[j + 1]
            darkenedData[j + 2] = data[j + 2];
            darkenedData[j + 3] = data[j + 3];
        }
        j += 4;
    }
    ctx.putImageData(new ImageData(darkenedData, video.videoWidth, video.videoHeight), 0, 0);
}