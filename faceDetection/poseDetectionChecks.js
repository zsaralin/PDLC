//checks whether the top of the face is above the top boundary of the video 
export function faceInFrame(person) {
    if (person) {
        const video = document.querySelector('.video');
        if (!video) {
            return false; 
        }
        const nose = person.keypoints[0];
        const leftEar = person.keypoints[7];
        const rightEar = person.keypoints[8];
        const faceWidth = Math.abs(leftEar.x - rightEar.x);

        const faceLeftX = nose.x - faceWidth / 2;
        const faceRightX = nose.x + faceWidth / 2;
        
        if (faceLeftX < 0 || faceRightX > video.videoWidth) {
            return false;
        }
        
        if (nose.y - faceWidth / 2 < 0) {
            return false;
        }

        return true;
    }
    return false;
}

const prevDetection = []


export function isFacingForward(person) {
    if (!person || !person.keypoints) {
        return false;
    }

    const nose = person.keypoints[0];
    const leftEar = person.keypoints[7];
    const rightEar = person.keypoints[8];
    if (!nose || !leftEar || !rightEar) {
        return false;
    }

    const midPointX = (leftEar.x + rightEar.x) / 2;
    const midPointY = (leftEar.y + rightEar.y) / 2;

    const deltaX = nose.x - midPointX;
    const deltaY = nose.y - midPointY;
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI; // Convert radians to degrees

    const normalizedAngle = Math.abs(angle); // This normalizes the angle to positive values only

    const forwardAngleRange = 10; // Allowable angle range in degrees to still be considered facing forward

    return !(normalizedAngle <= forwardAngleRange || normalizedAngle >= 170);
}

export function isEyeDistanceAboveThresholdFace(person) {
    if (!person.keypoints) {
        return false;
    }
    const leftEye = person.keypoints[0]; // Adjust index as needed
    const rightEye = person.keypoints[1]; // Adjust index as needed

    const distance = Math.sqrt(Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2));
    const thres = document.getElementById('minEyeDist').value;
    return distance > thres;
}

export function isEyeDistanceAboveThresholdBody(person) {
    if (!person.keypoints) {
        return false;
    }
    const leftEar = person.keypoints[3]; // Adjust index as needed
    const rightEar = person.keypoints[4]; // Adjust index as needed

    const distance = Math.sqrt(Math.pow(rightEar.x - leftEar.x, 2) + Math.pow(rightEar.y - leftEar.y, 2));
    const thres = document.getElementById('minEyeDist').value;
    return distance > thres;
}
