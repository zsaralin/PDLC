import {auto} from "./autoExposure.js";
import { SERVER_URL } from '../config.js';

let exposureCompValue = 8; // Initialize the variable with a default value

const exposureModeSelect = document.getElementById('exposureModeSelect');

// Add an event listener to the select element
exposureModeSelect.addEventListener('change', async function () {
    // Check the selected value and set 'manual' accordingly
    let exposureMode = (exposureModeSelect.value === 'manual') ? 1 : 8;
    await fetch(`${SERVER_URL}/set-camera-control`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                controlName: 'autoExposureMode',
                value: exposureMode
            })
        })
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
    await fetch(`${SERVER_URL}/set-camera-control`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            controlName: 'absoluteExposureTime',
            value: exposureTimeVal.value
        })
    })});