import { faceInFrame, isFacingForward , isEyeDistanceAboveThresholdBody} from "./poseDetectionChecks.js";

export let activeFaces = []
let detectionState = []; // Array of objects to track state and counter for each index
const updateInterval = 5 * 60 * 1000; // 5 minutes in milliseconds

export function processDetection(data, i) {
    if (!detectionState[i]) {
        detectionState[i] = { counter: 0, lastStatus: null, lastChanged: Date.now() };
    }
    const threshold = 50; // Threshold for switching from null to not null and vice versa
    let currentState = data.length > 0 ? 'DATA' : 'NODATA';

    if (currentState === 'DATA' && !additionalChecks(data)) {
        currentState = 'NODATA';  // Set to NODATA when additional checks fail
    }

    if (currentState === detectionState[i].lastStatus) {
        detectionState[i].counter++;
        if (currentState === 'DATA' && (Date.now() - detectionState[i].lastChanged) > updateInterval) {
            currentState = 'NODATA';
            detectionState[i].lastStatus = 'NODATA';
            detectionState[i].lastChanged = Date.now();  // Reset the timer
            detectionState[i].counter = 0;
        }
    } else {
        detectionState[i].counter = 1;
        detectionState[i].lastStatus = currentState;
        detectionState[i].lastChanged = Date.now();  // Reset the timer on state change
    }

    if (currentState === 'DATA') {
        if (detectionState[i].counter >= threshold || activeFaces[i] !== null) {
            let closestDistance = Number.POSITIVE_INFINITY;
            let closestPerson = activeFaces[i] || data[0]; // Default to first person if activeFaces is null

            for (const person of data) {
                const distance = calculateKeyPointsDistance(activeFaces[i]?.keypoints || [], person.keypoints);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestPerson = person;
                }
            }

            activeFaces[i] = closestPerson;
        }
    } else if (currentState === 'NODATA' && detectionState[i].counter >= threshold) {
        activeFaces[i] = null;
    }

    return activeFaces[i];
}


function calculateKeyPointsDistance(keypoints1, keypoints2) {
    let totalDistance = 0;
    let validPointsCount = 0;

    keypoints1.forEach((point1, index) => {
        const point2 = keypoints2[index];
        // Ensure the keypoint names match to compare corresponding points
        if (point1.name === point2.name && point1.score > 0.3 && point2.score > 0.3) {
            const deltaX = point1.x - point2.x;
            const deltaY = point1.y - point2.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            totalDistance += distance;
            validPointsCount++;
        }
    });

    // Avoid division by zero; if no valid points, set distance arbitrarily high
    return validPointsCount > 0 ? totalDistance / validPointsCount : Number.POSITIVE_INFINITY;
}

function additionalChecks(person){
    if(!isEyeDistanceAboveThresholdBody(person[0])
        || !faceInFrame(person[0])
        || !isFacingForward(person[0])){
        return false;
    }
    return true; 
}
