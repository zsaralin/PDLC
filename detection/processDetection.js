
const THRESHOLD_TO_NOT_NULL = 5; // Threshold for switching from null to not null
const THRESHOLD_TO_NULL = 5; // Threshold for switching from not null to null

export let activeFaces = [];
let detectionStates = []; // Array of objects to track state and counter for each index
const resetIntervalSlider = document.getElementById('resetInterval');

export function processDetection(detectionData, index) {
    if (!detectionStates[index]) {
        detectionStates[index] = { counter: 0, lastStatus: null, lastChanged: Date.now() };
    }

    const currentState = detectionData.length > 0 ? 'DETECTION' : 'NO_DETECTION';

    if (currentState === detectionStates[index].lastStatus) {
        detectionStates[index].counter++;
    } else {
        detectionStates[index].counter = 1;
        detectionStates[index].lastStatus = currentState;
        detectionStates[index].lastChanged = Date.now(); // Reset the timer on state change
    }

    if (currentState === 'DETECTION' && detectionStates[index].counter >= THRESHOLD_TO_NOT_NULL) {
        activeFaces[index] = detectionData; // Set active detection data
    } else if (currentState === 'NO_DETECTION' && detectionStates[index].counter >= THRESHOLD_TO_NULL) {
        activeFaces[index] = null; // Clear active detection data
    }

    return activeFaces[index];
}
