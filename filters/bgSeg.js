
export let bgSeg = false;
const bg = document.getElementById('bg');

export function toggleBgSeg(){
    bgSeg = !bgSeg;
}

let segmentationRunning = false; // Global flag to control execution

export function stopSegmentation() {
    segmentationRunning = false;
}
export function startSegmentation(){
    segmentationRunning = true;
}
let previousSegmentationComplete = true;

let segmentationProperties = {
    segmentationThreshold: 0.5,
    internalResolution: 'full',
}


export function segmentPersons(model, video, webcamCanvas, webcamCanvasCtx, tempCanvas, tempCanvasCtx) {
    // tempCanvasCtx.save(); // Save the current state of the context
    // tempCanvasCtx.scale(-1, 1); // Flip horizontally
    // tempCanvasCtx.translate(-tempCanvas.width, 0);
    tempCanvasCtx.drawImage(video, 0, 0);
    // tempCanvasCtx.restore(); // Restore the original state

    if (!segmentationRunning) {
        webcamCanvasCtx.clearRect(0,0, webcamCanvas.width, webcamCanvas.height)
        return; // Stop execution if segmentationRunning is false
    }

    if (previousSegmentationComplete) {
        previousSegmentationComplete = false;
        // Now classify the canvas image we have available.
        model.segmentPerson(tempCanvas, segmentationProperties)
            .then(segmentation => {
                processSegmentation(segmentation, webcamCanvas, webcamCanvasCtx, tempCanvasCtx);
                previousSegmentationComplete = true;
            });
    }
    // Call this function repeatedly to perform segmentation on all frames of the video.
    window.requestAnimationFrame(() => {
        segmentPersons(
            model,
            video,
            webcamCanvas,
            webcamCanvasCtx,
            tempCanvas,
            tempCanvasCtx,
            segmentationProperties
        );
    });
}
export function processSegmentation(segmentation, webcamCanvas, webcamCanvasCtx, tempCanvasCtx) {
    var imgData = tempCanvasCtx.getImageData(0, 0, webcamCanvas.width, webcamCanvas.height);
    // Loop through the pixels in the image
    for (let i = 0; i < imgData.data.length; i += 4) {
        let pixelIndex = i / 4;
        // Check if the pixel does not belong to a person using the body-pix
        // model's output data array. This removes all pixels corresponding to the
        // background.
        if (segmentation.data[pixelIndex] == 0) {
            // Darken the pixel by reducing its RGB values
            imgData.data[i] *= bg.value; // Adjust this value to control darkness
            imgData.data[i + 1] *= bg.value; // Adjust this value to control darkness
            imgData.data[i + 2] *= bg.value; // Adjust this value to control darkness
        }
    }
    // Draw the updated image on the canvas
    webcamCanvasCtx.putImageData(imgData, 0, 0);
}
