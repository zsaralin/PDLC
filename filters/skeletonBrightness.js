import {segmentationBrightness} from "../drawing/drawSegmentation.js";
import {applyBrightness} from "./brightness.js";

const slider = document.getElementById('targetBrightness')
export function adjustSkeletonBrightness(canvas) {
    // let averageLuminance = segmentationBrightness;
    // console.log('Average Luminance: ' + averageLuminance);
    //
    // const brightnessSlider = document.getElementById('brightness');
    // const targetBrightness = parseInt(slider.value, 10); // Ensure it's an integer
    // let adjustment = Math.round(targetBrightness - averageLuminance);
    //
    // // Correcting the application of Math.min and Math.max
    // const newSliderValue = Math.max(-250, Math.min(255, parseInt(brightnessSlider.value,10) + adjustment));
    // console.log('New Slider Value: ' + newSliderValue);
    //
    // // Update the slider value
    //     brightnessSlider.updateValue(newSliderValue); // If updateValue is a custom function
}