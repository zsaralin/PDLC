import { faceInFrame, isFacingForward , isEyeDistanceAboveThresholdBody} from "./poseDetectionChecks.js";
import {appVersion} from "../UIElements/appVersionHandler.js";

export let activeFaces = []
let detectionState = []; // Array of objects to track state and counter for each index
const resetIntervalSlider = document.getElementById('resetInterval')
export function processDetection(data, i) {
    const resetInterval = resetIntervalSlider.value * 60 * 1000; // Reset interval in milliseconds
    const thresholdToNotNull = 5; // Threshold for switching from null to not null
    const thresholdToNull = 5; // Threshold for switching from not null to null

    if (!detectionState[i]) {
        detectionState[i] = { counter: 0, lastStatus: null, lastChanged: Date.now() };
    }

    let currentState = data.length > 0 ? 'DATA' : 'NODATA';

    if (currentState === 'DATA' && !additionalChecks(data)) {
        currentState = 'NODATA'; // Set to NODATA when additional checks fail
    }

    if (currentState === detectionState[i].lastStatus) {
        detectionState[i].counter++;
        if (currentState === 'DATA' && (Date.now() - detectionState[i].lastChanged) > resetInterval) {
            currentState = 'NODATA';
            detectionState[i].lastStatus = 'NODATA';
            detectionState[i].lastChanged = Date.now(); // Reset the timer
            detectionState[i].counter = 0;
            activeFaces[i] = getClosestPerson(data);
        }
    } else {
        detectionState[i].counter = 1;
        detectionState[i].lastStatus = currentState;
        detectionState[i].lastChanged = Date.now(); // Reset the timer on state change

        // Dispatch custom events on state change
        if (currentState === 'NODATA') {
            document.dispatchEvent(new CustomEvent('stateChange', { detail: { index: i, state: 'NULL' } }));
        } else if (currentState === 'DATA') {
            document.dispatchEvent(new CustomEvent('stateChange', { detail: { index: i, state: 'NOT_NULL' } }));
        }
    }

    if (currentState === 'DATA') {
        if (detectionState[i].counter >= thresholdToNotNull || activeFaces[i] !== null) {
            let closestDistance = Number.POSITIVE_INFINITY;
            let closestPerson = activeFaces[i] || data[0]; // Default to first person if activeFaces is null
            for (const person of data) {
                const distance = calculateKeyPointsDistance(activeFaces[i]?.pose.keypoints || [], person.pose.keypoints);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestPerson = person;
                }
            }
            if (closestDistance === Number.POSITIVE_INFINITY || closestDistance < 50) {
                activeFaces[i] = closestPerson;
            }
        }
    } else if (currentState === 'NODATA' && detectionState[i].counter >= thresholdToNull) {
        activeFaces[i] = null;
    }

    return activeFaces[i];
}

function calculateScale(keypoints) {
    if (!keypoints) return 10000; // Default scale if no keypoints are available
    // Calculate scale, e.g., by finding the bounding box area
    let minX = Math.min(...keypoints.map(k => k.x));
    let maxX = Math.max(...keypoints.map(k => k.x));
    let minY = Math.min(...keypoints.map(k => k.y));
    let maxY = Math.max(...keypoints.map(k => k.y));
    return (maxX - minX) * (maxY - minY);
}
function calculateOKS(activeKeypoints, personKeypoints, scale) {
    let sumOKS = 0;
    let visibleCount = 0;

    activeKeypoints.forEach((activePoint, index) => {
        if (activePoint.v > 0 && index < personKeypoints.length) {
            const personPoint = personKeypoints[index];
            if (personPoint.v > 0) {
                const dx = activePoint.x - personPoint.x;
                const dy = activePoint.y - personPoint.y;
                const distanceSquared = dx * dx + dy * dy;
                const keypointScale = scale * 2; // No need for kValues
                sumOKS += Math.exp(-distanceSquared / keypointScale) * (personPoint.v > 0);
                visibleCount++;
            }
        }
    });

    return visibleCount > 0 ? sumOKS / visibleCount : 0;
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
    if(appVersion === 'skeleton'){ return true}
    if(!isEyeDistanceAboveThresholdBody(person[0])
        || !faceInFrame(person[0])
        || !isFacingForward(person[0])){
        return false;
    }
    return true; 
}
