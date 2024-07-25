import { faceInFrame, isFacingForward , isEyeDistanceAboveThresholdBody} from "./detectionChecks.js";
import {appVersion} from "../UIElements/appVersionHandler.js";

const THRESHOLD_TO_NOT_NULL = 5; // Threshold for switching from null to not null
const THRESHOLD_TO_NULL = 5; // Threshold for switching from not null to null

export let activeFaces = []
let detectionState = []; // Array of objects to track state and counter for each index
const resetIntervalSlider = document.getElementById('resetInterval')
export function processDetection(data, i) {
    if (!detectionState[i]) {
        detectionState[i] = { counter: 0, lastStatus: null, lastChanged: Date.now() };
    }

    let currentState = data.length > 0 ? 'DATA' : 'NODATA';

    if (currentState === 'DATA' && !additionalChecks(data)) {
        currentState = 'NODATA';  // Set to NODATA when additional checks fail
    }

    if (currentState === detectionState[i].lastStatus) {
        detectionState[i].counter++;
    //     if (currentState === 'DATA' && (Date.now() - detectionState[i].lastChanged) > RESET_INTERVAL) {
    //         currentState = 'NODATA';
    //         detectionState[i].lastStatus = 'NODATA';
    //         detectionState[i].lastChanged = Date.now();  // Reset the timer
    //         detectionState[i].counter = 0;
    //         activeFaces[i] = getLargestFace(data);
    //     }
    // } else {
        detectionState[i].counter = 1;
        detectionState[i].lastStatus = currentState;
        detectionState[i].lastChanged = Date.now();  // Reset the timer on state change
    }

    if (currentState === 'DATA') {
        if (detectionState[i].counter >= THRESHOLD_TO_NOT_NULL || activeFaces[i] !== null) {
            activeFaces[i] = data; // Set active face data
        }
    } else if (currentState === 'NODATA' && detectionState[i].counter >= THRESHOLD_TO_NULL) {
        activeFaces[i] = null; // Clear active face data
    }

    return activeFaces[i];
}

function getLargestFace(data) {
    let closestPerson = null;
    let minDistance = Number.POSITIVE_INFINITY;

    for (const person of data) {
        // Check for the presence of keypoints: leftEar (3), rightEar (4), nose (0), and midHip (11)
        const leftEar = person.keypoints[3];
        const rightEar = person.keypoints[4];
        const nose = person.keypoints[0];
        const midHip = person.keypoints[11];

        // Calculate the horizontal distance between ears
        const earDistance = (leftEar.score > 0.3 && rightEar.score > 0.3) ? Math.abs(leftEar.x - rightEar.x) : null;

        // Calculate the vertical distance between the nose and midHip
        const verticalDistance = (nose.score > 0.3 && midHip.score > 0.3) ? Math.abs(nose.y - midHip.y) : null;

        // Use the larger of the two distances as a measure of closeness
        let distance = null;
        if (earDistance !== null && verticalDistance !== null) {
            distance = Math.max(earDistance, verticalDistance);
        } else if (earDistance !== null) {
            distance = earDistance;
        } else if (verticalDistance !== null) {
            distance = verticalDistance;
        }

        // Update the closest person if a valid distance is found and it's the smallest so far
        if (distance !== null && distance < minDistance) {
            minDistance = distance;
            closestPerson = person;
        }
    }

    return closestPerson;
}
function calculateKeyPointsDistance(keypoints1, keypoints2) {
    let totalDistance = 0;
    let validPointsCount = 0;

    keypoints1.forEach((point1, index) => {
        const point2 = keypoints2[index];
        if(!point1 || !point2) return;        // Ensure the keypoint names match to compare corresponding points
        if (point1.score > 0.3 && point2.score > 0.3) {
            const deltaX = point1.position.x - point2.position.x;
            const deltaY = point1.position.y - point2.position.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            totalDistance += distance;
            validPointsCount++;
        }
    });

    // Avoid division by zero; if no valid points, set distance arbitrarily high
    return validPointsCount > 0 ? totalDistance / validPointsCount : Number.POSITIVE_INFINITY;
}

function additionalChecks(person){
    return true; 
    return !(!isEyeDistanceAboveThresholdBody(person[0]) || !faceInFrame(person[0]) || !isFacingForward(person[0]));

}
