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
        currentState = 'NODATA';  // Set to NODATA when additional checks fail
    }

    if (currentState === detectionState[i].lastStatus) {
        detectionState[i].counter++;
        if (currentState === 'DATA' && (Date.now() - detectionState[i].lastChanged) > resetInterval) {
            currentState = 'NODATA';
            detectionState[i].lastStatus = 'NODATA';
            detectionState[i].lastChanged = Date.now();  // Reset the timer
            detectionState[i].counter = 0;
            activeFaces[i] = getLargestFace(data);
        }
    } else {
        detectionState[i].counter = 1;
        detectionState[i].lastStatus = currentState;
        detectionState[i].lastChanged = Date.now();  // Reset the timer on state change
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
    let largestPerson = null;
    let maxDistance = -1;

    // Iterate over each person to calculate the face width and find the largest
    for (const person of data) {
        if (person.keypoints[3] && person.keypoints[4]) {
            const distance = Math.abs(person.keypoints[4].x - person.keypoints[3].x);
            if (distance > maxDistance) {
                maxDistance = distance;
                largestPerson = person;
            }
        }
    }

    return largestPerson;
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
