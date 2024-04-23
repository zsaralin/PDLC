import { SERVER_URL } from '../config.js';

let brightness = 0;
let contrast = 50;
let saturation = 50;
let sharpness = 50;
let gain = 50; 
let whiteMode = 'continuous'
let colourTemp = 5500;
let backlight = 1; 

async function getControlValues(){
    try {
        const response = await fetch(`${SERVER_URL}/get-control-values`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                camIndex: 0,
            })
        });
        if (response.ok) {
            const data = await response.json(); // Parse the JSON response body
            return data.controlValues; // Extract control values from the response
        } else {
            console.error('Failed to fetch control values:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching control values:', error);
    }
}

export async function initCamFilters() {
    const settings = await getControlValues()
    // Update initial values based on the settings
     brightness = settings['brightness'] ?? 0;
     contrast = settings["contrast"]  ?? 50;
     saturation = settings["saturation"] ?? 50;
     sharpness = settings["sharpness"] ?? 50;
     gain = settings["gain"] ?? 50
     backlight = settings["backlightCompensation"] ?? 1

    // Assume white balance mode and color temperature are part of your settings, if supported
    whiteMode = settings["autoWhiteBalance"] === 1 ? 'continuous' : 'manual' 
    colourTemp = settings["whiteBalanceTemperature"] ?? 5500;

    const brightnessSlider = document.getElementById("camBrightness");
    brightnessSlider.updateSliderProperties(brightness);

    const contrastSlider = document.getElementById("camContrast");
    contrastSlider.updateSliderProperties(contrast);

    const saturationSlider = document.getElementById("camSaturation");
    saturationSlider.updateSliderProperties(saturation);

    const sharpnessSlider = document.getElementById("camSharpness");
    sharpnessSlider.updateSliderProperties(sharpness);

    const gainSlider = document.getElementById("camGain");
    gainSlider.updateSliderProperties(gain);

    const backlightSlider = document.getElementById("camBacklight");
    backlightSlider.updateSliderProperties(backlight);

    const colourTempContainer = document.getElementById("colourTempContainer");
    const colourTempSlider = document.getElementById("colourTemp");
    colourTempSlider.updateSliderProperties(colourTemp);

    // await track.applyConstraints({['focusMode']: 'continuous'})
    const whiteBalanceModeSelect = document.getElementById("WhiteBalanceModeSelect");
    if (settings) {
        whiteBalanceModeSelect.addEventListener("change", async function () {
            const selectedMode = this.value; // Get the selected mode
            colourTempContainer.style.display = selectedMode === 'manual' ? 'block' : 'none'; // Show the slider
            
            whiteMode = this.value === 'continuous' ? '1' : '0';
            await fetch(`${SERVER_URL}/set-camera-control`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                controlName: 'autoWhiteBalance',
                value: whiteMode,
                camIndex: 0
            })

        });
    })
    }

    const sliders = [
        {slider: brightnessSlider, value: brightness, property: 'brightness'},
        {slider: contrastSlider, value: contrast, property: 'contrast'},
        {slider: saturationSlider, value: saturation, property: 'saturation'},
        {slider: sharpnessSlider, value: sharpness, property: 'sharpness'},
        {slider: gainSlider, value: gain, property: 'gain'},
        {slider: backlightSlider, value: backlight, property: 'backlightCompensation'},
        {slider: colourTempSlider, value: colourTemp, property: 'whiteBalanceTemperature'},
    ];

    for (const {slider, value, property} of sliders) {
        slider.addEventListener("valueChanged", async function () {
            await fetch(`${SERVER_URL}/set-camera-control`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            controlName: property,
            value: this.value,
            camIndex: 0 ,
        })

        });
        });
    }
}