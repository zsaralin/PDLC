import { faceInFrame, isJumping } from "./poseDetectionChecks.js";

export let activeFaces = []
let detectionState = []; // Array of objects to track state and counter for each index

export function processDetection(data, i) {
    if (!detectionState[i]) {
        detectionState[i] = { counter: 0, lastStatus: null };
    }

    const threshold = 10; // Threshold for switching from null to not null and vice versa
    const dataPresent = data.length > 0;
    const currentState = dataPresent  ? 'DATA' : 'NODATA';
 // && faceInFrame(data[0]) && !isJumping(data[0], i)
    // Check if current state is the same as the last recorded state
    if (currentState === detectionState[i].lastStatus) {
        // Increment counter if state remains the same
        detectionState[i].counter++;
    } else {
        // Reset counter and update last status on state change
        detectionState[i].counter = 1;

        detectionState[i].lastStatus = currentState;
    }

    // Handle updating activeFaces based on the current and last recorded states
    if (currentState === 'DATA') {
        if (detectionState[i].counter >= threshold || activeFaces[i] !== null) {
            // If switching to DATA is consistent or activeFaces is already non-null, update activeFaces
            let closestDistance = Number.POSITIVE_INFINITY;
            let closestPerson = activeFaces[i] || data[0]; // Default to first set if activeFaces is null

            for (const person of data) {
                const distance = calculateKeyPointsDistance(activeFaces[i]?.keypoints || [], person.keypoints);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestPerson = person;
                }
            }

            activeFaces[i] = closestPerson;
            // Optionally, reset counter here if you want the threshold check to restart after an update
            // detectionState[i].counter = 0;
        }
    } else if (currentState === 'NODATA' && detectionState[i].counter >= threshold) {
        // If switching to NODATA is consistent for at least 'threshold' detections, set activeFaces to null
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
