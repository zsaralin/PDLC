import {segmentationBrightness} from "../drawing/drawSegmentation.js";

const targetSlider = document.getElementById('targetBrightness')
export function adjustSkeletonBrightness() {
    const averageLuminance = segmentationBrightness; // Assuming this imports a function or variable

    const brightnessSlider = document.getElementById('brightness');

    let adjustment = 5

    if (averageLuminance < targetSlider.value - 10) {
        const newSliderValue = Math.max(-254, Math.min(255, parseInt(brightnessSlider.value, 10) + adjustment));
        brightnessSlider.updateValue(newSliderValue);
    } else if (averageLuminance > targetSlider.value + 10) {
        const newSliderValue = Math.max(-254, Math.min(255, parseInt(brightnessSlider.value, 10) - adjustment));
        brightnessSlider.updateValue(newSliderValue); // If updateValue is a custom function
    }
}