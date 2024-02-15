import {auto} from "./autoExposure.js";
export let track;
let exposureCompValue = 0; // Initialize the variable with a default value

export function sendTrack(i){
    track = i;
}

const exposureModeSelect = document.getElementById('exposureModeSelect');

// Add an event listener to the select element
exposureModeSelect.addEventListener('change', async function () {
    // Check the selected value and set 'manual' accordingly
    let manual = (exposureModeSelect.value === 'manual');
    if (manual) {
        await track.applyConstraints({exposureMode: 'manual'});
        await track.applyConstraints({exposureCompensation: exposureCompValue, exposureTime: 50});
    } else{
        await track.applyConstraints({exposureMode: 'continuous'});
    }

});

// Get the input range element and the span to display the value
const exposureCompVal = document.getElementById('exposureCompVal');
const exposureCompSpan = document.getElementById('exposureComp');

exposureCompVal.addEventListener('input', async function () {
    exposureCompValue = parseInt(exposureCompVal.value);
    exposureCompSpan.textContent = exposureCompValue;
    await track.applyConstraints({exposureCompensation: exposureCompValue});
});

const exposureTimeVal = document.getElementById('exposureTimeVal');
const exposureTimeSpan = document.getElementById('exposureTime');

exposureTimeVal.addEventListener('input', async function () {
    const exposureTimeValue = parseInt(exposureTimeVal.value);
    exposureTimeSpan.textContent = exposureTimeValue + ' ms'; // Update the span with the new value
    await track.applyConstraints({ exposureTime: exposureTimeValue }); // Apply the new exposure time
});