import { angle , mirror} from "../UIElements/videoOrientation.js";
let roi;
let showOuterRoi = false;
const outerRoiCheckbox = document.getElementById('outerRoi');
let video; 
outerRoiCheckbox.addEventListener('change', function() {
    showOuterRoi = this.checked;
    console.log('Show Outer ROI:', showOuterRoi); // Logging the state for demonstration
});

export function initOuterRoi(v) {
    video = v; 
    const roiWidthInput = document.getElementById('outerROIWidth');
    const roiHeightInput = document.getElementById('outerROIHeight');
    const w = video.videoWidth;
    const h = video.videoHeight;

    roiWidthInput.updateSliderProperties(w, 0 ,w)
    roiHeightInput.updateSliderProperties(h, 0 , h)


    updateOuterRoi()
}

export function updateOuterRoi() {
    const roiWidthInput = document.getElementById('outerROIWidth');
    const roiHeightInput = document.getElementById('outerROIHeight');
    const roiWidth = parseInt(roiWidthInput.value, 10);
    const roiHeight = parseInt(roiHeightInput.value, 10);

    roi = {
        x: (video.videoWidth - roiWidth) / 2,
        y: (video.videoHeight -roiHeight) / 2,
        width: roiWidth,
        height: roiHeight
    };
}

export function copyVideoToCanvas(ctx, video, canvas) {
    const radians = angle * Math.PI / 180; // Convert to radians
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Apply mirroring if needed
    // if (mirror) {
        // ctx.scale(-1, 1); // This flips the context horizontally
    // }

    ctx.rotate(radians);

    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const rects = [
        { x: 0, y: 0, width: video.videoWidth, height: roi.y },
        { x: 0, y: roi.y, width: roi.x, height: roi.height },
        { x: roi.x + roi.width, y: roi.y, width: video.videoWidth - roi.x - roi.width, height: roi.height },
        { x: 0, y: roi.y + roi.height, width: video.videoWidth, height: video.videoHeight - roi.y - roi.height }
    ];

    ctx.fillStyle = 'rgba(0, 0, 0, 1)'; 
    rects.forEach(rect => {
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    });
    ctx.restore();
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