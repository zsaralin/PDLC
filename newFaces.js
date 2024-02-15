
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
            const distance = calculateLandmarkDistance(activeFace.landmarks.positions, person.landmarks.positions);
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
    const sumOfSquares = landmarks1.reduce((sum, point, index) => {
        const deltaX = point.x - landmarks2[index].x;
        const deltaY = point.y - landmarks2[index].y;
        return sum + deltaX * deltaX + deltaY * deltaY;
    }, 0);

    return Math.sqrt(sumOfSquares);
}