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
