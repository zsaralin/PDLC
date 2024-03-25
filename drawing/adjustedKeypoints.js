import {angle, mirror} from '../UIElements/videoOrientation.js'
export function adjustPersonKeypoints(persons, canvasWidth, canvasHeight) {
    // Check if the persons array is not empty and has a first element to adjust
    if (persons.length > 0) {
        const firstPerson = persons[0];
        const adjustedKeypoints = firstPerson.keypoints.map(kp => {
            let adjustedX = kp.x;
            let adjustedY = kp.y;

            // Normalize angle to the range [0, 360)
            let theAngle = ((angle % 360) + 360) % 360;

            // Apply rotation adjustments
            switch (theAngle) {
                case 90:
                    [adjustedX, adjustedY] = [kp.y, canvasWidth - kp.x];
                    break;
                case 180:
                    [adjustedX, adjustedY] = [canvasWidth - kp.x, canvasHeight - kp.y];
                    break;
                case 270:
                    [adjustedX, adjustedY] = [canvasHeight - kp.y, kp.x];
                    break;
                // No adjustment needed for 0 degrees
            }

            // Apply mirroring adjustment (assuming horizontal mirror)
            if (mirror) {
                // adjustedX = canvasWidth - adjustedX;
            }

            return {
                ...kp,
                x: adjustedX,
                y: adjustedY
            };
        });

        // Update the first person object with adjusted keypoints
        persons[0] = {
            ...firstPerson,
            keypoints: adjustedKeypoints
        };
    }

    // Return the updated persons array with the first person's keypoints adjusted
    return persons;
}