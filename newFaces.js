
export let activeFace = null;
export function processDetection(data) {
    if (!activeFace && data.length > 0) {
        activeFace = data[0];
    }else if(data.length === 0){
        activeFace = null
    } else {
        // Find the person in data with landmarks closest to activeFace landmarks
        let closestDistance = Number.POSITIVE_INFINITY;
        let closestPerson = activeFace;

        for (const person of data) {
            const distance = calculateLandmarkDistance(activeFace.boundingBox, person.boundingBox);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestPerson = person;
            }
        }

        activeFace = closestPerson;
    }

    return activeFace;
}
function calculateLandmarkDistance(landmarks1, landmarks2) {
    // Assuming landmarks1 and landmarks2 are objects with originX, originY properties
    const deltaX = landmarks1.originX - landmarks2.originX;
    const deltaY = landmarks1.originY - landmarks2.originY;

    // Calculate the Euclidean distance between the two points
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    return distance;
}
