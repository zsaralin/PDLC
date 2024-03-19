
export let activeFaces = [null,null];
export function processDetection(data,i) {
    if (!activeFaces[i] && data.length > 0) {
        activeFaces[i] = data[0];
    }else if(data.length === 0){
        activeFaces[i] = null
    } else {
        // Find the person in data with landmarks closest to activeFace landmarks
        let closestDistance = Number.POSITIVE_INFINITY;
        let closestPerson = activeFaces[i];

        for (const person of data) {
            // const distance = calculateLandmarkDistance(activeFace.boundingBox, person.boundingBox);
            const distance = calculateKeyPointsDistance(activeFaces[i].keypoints, person.keypoints);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestPerson = person;
            }
        }

        activeFaces[i] = closestPerson;
    }

    return activeFaces[i];
}
function calculateLandmarkDistance(landmarks1, landmarks2) {
    // Assuming landmarks1 and landmarks2 are objects with originX, originY properties
    const deltaX = landmarks1.originX - landmarks2.originX;
    const deltaY = landmarks1.originY - landmarks2.originY;

    // Calculate the Euclidean distance between the two points
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    return distance;
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
