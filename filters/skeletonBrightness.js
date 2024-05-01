import {segmentationBrightness} from "../drawing/drawSegmentation.js";
import {applyBrightness} from "./brightness.js";

const slider = document.getElementById('skeletonBrightness')
export function adjustSkeletonBrightness(canvas) {

    let averageLuminance = segmentationBrightness
    const brightnessSlider = document.getElementById('brightness');
    const targetBrightness = slider.value;
    const adjustment = targetBrightness - averageLuminance;
    // Ensuring the value remains within the valid range for the slider
    const maxAdjustment = 1;
    const boundedAdjustment = Math.max(-maxAdjustment, Math.min(maxAdjustment, adjustment));
    const newSliderValue = Math.max(0, Math.min(255, parseInt(slider.value, 10) + boundedAdjustment));
    // Update the slider value
    brightnessSlider.value = newSliderValue;
    applyBrightness(canvas)
}