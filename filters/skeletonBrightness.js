import { segmentationBrightness } from "../drawing/drawSegmentation.js";

let initialized = false;
let targetSlider, brightnessSlider;

function initializeElements() {
    if (initialized) return;

    targetSlider = document.getElementById('targetBrightness');
    brightnessSlider = document.getElementById('brightness');

    initialized = true;
}
function updateBrightnessSlider(newValue) {
    brightnessSlider.value = newValue;
}

export function adjustSkeletonBrightness() {
    initializeElements();

    const averageLuminance = segmentationBrightness;
    const targetValue = parseInt(targetSlider.value, 10);
    const currentBrightness = parseInt(brightnessSlider.value, 10);

    const adjustment = 5;
    const lowVal = -255

    if (averageLuminance < targetValue - 10) {
        brightnessSlider.value = Math.max(lowVal, Math.min(255, parseInt(currentBrightness, 10) + adjustment));
    } else if (averageLuminance > targetValue + 10) {
        brightnessSlider.value =Math.max(lowVal, Math.min(255, parseInt(currentBrightness, 10) - adjustment));
    }
}
