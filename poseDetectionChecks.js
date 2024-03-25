export function faceInFrame(person) {
    if (person) {
        const nose = person.keypoints[0]
        const leftEar = person.keypoints[7]
        const rightEar = person.keypoints[8]
        const faceWidth = Math.abs(leftEar.x - rightEar.x);

        if (nose.y - faceWidth / 2 < 0) return false
        return true;
    }
}

const prevDetection = []

// Function to detect 'false positives' by checking for significant jumps in position
export function isJumping(person, i) {
    if (person && person.keypoints && person.keypoints[0]) {
        const nose = person.keypoints[0]; // Assuming the first keypoint is the nose
        const threshold = 50; // Define a threshold for the "jump" size

        if (prevDetection[i]) {
            const dx = nose.x - prevDetection[i].x;
            const dy = nose.y - prevDetection[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy); // Euclidean distance

            prevDetection[i] = {x: nose.x, y: nose.y};

            return distance > threshold;
        } else {
            prevDetection[i] = {x: nose.x, y: nose.y};
            return false;
        }
    }
    return false;
}