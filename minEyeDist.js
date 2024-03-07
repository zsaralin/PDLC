
let minDist = 0;
export function isEyeDistanceAboveThreshold(person) {
    if (!person.keypoints) {
        return false; // Return false if landmarks are not available
    }

    // Get the positions of the left and right eye landmarks
    const leftEye = person.keypoints[0]; // Adjust index as needed
    const rightEye = person.keypoints[1]; // Adjust index as needed

    // Calculate the Euclidean distance between the left and right eyes
    const distance = Math.sqrt(Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2));

    // Check if the distance is greater than the threshold (50)
    return distance > minDist;
}

// export function isEyeDistanceAboveThreshold(person) {
//     if (!person.landmarks || !person.landmarks.positions) {
//         return false; // Return false if landmarks are not available
//     }
//
//     // Get the positions of the left and right eye landmarks
//     const leftEye = person.landmarks.positions[36]; // Adjust index as needed
//     const rightEye = person.landmarks.positions[45]; // Adjust index as needed
//
//     // Calculate the Euclidean distance between the left and right eyes
//     const distance = Math.sqrt(Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2));
//
//     // Check if the distance is greater than the threshold (50)
//     return distance > minDist;
// }

export function initMinDistSlider() {
    const timeSlider = document.getElementById("minEyeDist");
    const sliderValue = document.getElementById("minEyeDistValue");
    // Update the slider value display initially
    sliderValue.textContent = timeSlider.value;
    minDist = parseInt(timeSlider.value);
    // Add an event listener to update the display and updateCount when the slider value changes
    timeSlider.addEventListener("input", function () {
        sliderValue.textContent = timeSlider.value;
        minDist = parseInt(timeSlider.value); // Convert to integer and update updateCount
    });
}