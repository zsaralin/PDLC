let roi;
let showOuterRoi = false;
const outerRoiCheckbox = document.getElementById('outerRoi');

outerRoiCheckbox.addEventListener('change', function() {
    // Update the variable based on the checkbox state
    showOuterRoi = this.checked;
    console.log('Show Outer ROI:', showOuterRoi); // Logging the state for demonstration
});

// Get the checkbox element by its ID
export function initOuterRoi(video) {
    // Get the input elements and display values
    const roiWidthInput = document.getElementById('outerROIWidth');
    const roiHeightInput = document.getElementById('outerROIHeight');
    const roiWidthValue = document.getElementById('outerROIWidthValue');
    const roiHeightValue = document.getElementById('outerROIHeightValue');

    // Set the max attributes based on the video dimensions
    roiWidthInput.max = video.videoWidth;
    roiHeightInput.max = video.videoHeight;

    roiWidthInput.value =video.videoWidth;
    roiHeightInput.value =  video.videoHeight;
    // Initialize displayed values
    roiWidthValue.textContent =  video.videoWidth;
    roiHeightValue.textContent = video.videoHeight;

    // Function to update ROI and redraw the canvas
    function updateRoi() {
        // Update the global variables
        const roiWidth = parseInt(roiWidthInput.value, 10);
        const roiHeight = parseInt(roiHeightInput.value, 10);

        // Recalculate the ROI
        roi = {
            x: (video.videoWidth - roiWidth) / 2,
            y: (video.videoHeight -roiHeight) / 2,
            width: roiWidth,
            height: roiHeight
        };

        // Redraw the canvas with the new ROI
    }

    // Listen for changes on the inputs to update the displayed value and ROI
    roiWidthInput.addEventListener('input', function() {
        roiWidthValue.textContent = roiWidthInput.value;
        updateRoi();
    });

    roiHeightInput.addEventListener('input', function() {
        roiHeightValue.textContent = roiHeightInput.value;
        updateRoi();
    });

    // Initial call to set up the ROI based on initial input values
    updateRoi();
}
export function processVideoFrame(processingCtx, video, canvas) {
    processingCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const rects = [
        { x: 0, y: 0, width: video.videoWidth, height: roi.y }, // Top rectangle
        { x: 0, y: roi.y, width: roi.x, height: roi.height }, // Left rectangle
        { x: roi.x + roi.width, y: roi.y, width: video.videoWidth - roi.x - roi.width, height: roi.height }, // Right rectangle
        { x: 0, y: roi.y + roi.height, width: video.videoWidth, height: video.videoHeight - roi.y - roi.height } // Bottom rectangle
    ];

    processingCtx.fillStyle = 'rgba(0, 0, 0, 1)'; // Fully opaque black
    rects.forEach(rect => {
        processingCtx.fillRect(rect.x, rect.y, rect.width, rect.height);
    });
}

export function drawOuterRoi(canvas){
    const ctx = canvas.getContext('2d', {willReadFrequently: true});
    if(showOuterRoi) {
        ctx.fillStyle = 'black';
        ctx.globalAlpha = 1;
        ctx.fillRect(0, 0, canvas.width, roi.y);
        ctx.fillRect(0, roi.y + roi.height, canvas.width, canvas.height - roi.y - roi.height);
        ctx.fillRect(0, roi.y, roi.x, roi.height);
        ctx.fillRect(roi.x + roi.width, roi.y, canvas.width - roi.x - roi.width, roi.height);
        ctx.globalAlpha = 0.9;
    }
}