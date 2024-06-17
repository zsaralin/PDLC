import { appVersion } from "../UIElements/appVersionHandler.js";
import {segmentationBrightness} from "../drawing/drawSegmentation.js";

const targetSlider = document.getElementById('targetBrightness')
export function adjustSkeletonBrightness() {
    const averageLuminance = segmentationBrightness; // Assuming this imports a function or variable

    const brightnessSlider = document.getElementById('brightness');

    let adjustment = 5
    let lowVal = appVersion.value === "skeleton" ? -255: -254
    if (averageLuminance < targetSlider.value - 10) {
        const newSliderValue = Math.max(lowVal, Math.min(255, parseInt(brightnessSlider.value, 10) + adjustment));
        brightnessSlider.updateValue(newSliderValue);
    } else if (averageLuminance > targetSlider.value + 10) {
        const newSliderValue = Math.max(lowVal, Math.min(255, parseInt(brightnessSlider.value, 10) - adjustment));
        brightnessSlider.updateValue(newSliderValue); // If updateValue is a custom function
    }
}