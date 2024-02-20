import {track} from "./exposure.js";

let brightness = 128;
let contrast = 128;
let saturation = 128;
let sharpness = 128;
let whiteMode = 'continuous'
let colourTemp = 5500;
export async function initCamFilters() {
    // Assuming 'track' is passed as a parameter and is a MediaStreamTrack with video settings
    if(!track) return
    const settings = track.getSettings();

    // Update initial values based on the settings
     brightness = settings['brightness'] || 128;
     contrast = settings["contrast"] || 128;
     saturation = settings["saturation"] || 128;
     sharpness = settings["sharpness"] || 128;
    // Assume white balance mode and color temperature are part of your settings, if supported
     whiteMode = settings["whiteBalanceMode"] || 'continuous';
     colourTemp = settings["colorTemperature"] || 5500;

    const brightnessSlider = document.getElementById("camBrightness");
    const brightnessSliderVal = document.getElementById("camBrightnessValue");
    brightnessSliderVal.textContent = brightness;
    brightnessSlider.value = brightness;

    const contrastSlider = document.getElementById("camContrast");
    const contrastSliderVal = document.getElementById("camContrastValue");
    contrastSliderVal.textContent = contrast;
    contrastSlider.value = contrast;

    const saturationSlider = document.getElementById("camSaturation");
    const saturationSliderVal = document.getElementById("camSaturationValue");
    saturationSliderVal.textContent = saturation;
    saturationSlider.value = saturation;

    const sharpnessSlider = document.getElementById("camSharpness");
    const sharpnessSliderVal = document.getElementById("camSharpnessValue");
    sharpnessSliderVal.textContent = sharpness;
    sharpnessSlider.value = sharpness;

    const colourTempContainer = document.getElementById("colourTempContainer");
    const colourTempSlider = document.getElementById("colourTemp");
    const colourTempSliderVal = document.getElementById("colourTempValue");
    colourTempSliderVal.textContent = colourTemp;
    colourTempSliderVal.value = colourTemp;

    const whiteBalanceModeSelect = document.getElementById("WhiteBalanceModeSelect");
    if (settings && settings['whiteBalanceMode']) {
        whiteBalanceModeSelect.addEventListener("change", async function () {
            const selectedMode = this.value; // Get the selected mode
            if (selectedMode === 'manual') {
                colourTempContainer.style.display = 'block'; // Show the slider
            } else {
                colourTempContainer.style.display = 'none'; // Hide the slider
            }

            whiteMode = this.value;
            await track.applyConstraints({['whiteBalanceMode']: this.value});

        });
    }

    const sliders = [
        {slider: brightnessSlider, value: brightness, property: 'brightness'},
        {slider: contrastSlider, value: contrast, property: 'contrast'},
        {slider: saturationSlider, value: saturation, property: 'saturation'},
        {slider: sharpnessSlider, value: sharpness, property: 'sharpness'},
        {slider: colourTempSlider, value: colourTemp, property: 'colorTemperature'},
    ];

    for (const {slider, value, property} of sliders) {
        const sliderVal = document.getElementById(`${slider.id}Value`);
        sliderVal.textContent = value;

        if (settings && settings[property]) {
            await track.applyConstraints({[property]: value});
            slider.addEventListener("input", async function () {
                sliderVal.textContent = this.value;
                await track.applyConstraints({[property]: this.value});
            });
        } else {
            console.log(`${property} setting is not available for this camera.`);
        }
    }
}