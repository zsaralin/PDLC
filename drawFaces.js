// helper function to draw d
// detected faces

import {center, filteredCanvas} from "./filteredCanvas.js";
import {isEyeDistanceAboveThreshold} from "./minEyeDist.js";

const padding = 40;

export function clearCanvas(canvas){
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

}
export function drawFaces(canvas, person, video) {
    const ctx = canvas.getContext('2d', {willReadFrequently: true});
    if (!ctx) return;
    if(!isEyeDistanceAboveThreshold(person)){
        console.log('clearing pixel canvas')
        clearPixelCanvas()
        return
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 3;
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    ctx.globalAlpha = 0.9;

    filteredCanvas(video, canvas, person)

    drawBB(person)
    // drawROI()
    // ctx.rect(person.detection.box.x - padding, person.detection.box.y - padding, person.detection.box.width + (padding * 2), person.detection.box.height + (padding*2));
    // ctx.stroke();
    // drawNose(person.landmarks.positions[27], person.landmarks.positions[33]);
    // drawCurvedEyebrow(person.landmarks.positions.slice(17, 22)); // Left eyebrow
    // drawCurvedEyebrow(person.landmarks.positions.slice(22, 27)); // Right eyebrow
    // drawMouth(person.landmarks.positions.slice(48, 67)); // Mouth
    // drawNoseCurve(person.landmarks.positions);
    // drawEyesWithCurves(person.landmarks.positions.slice(36, 42)); // Left eye
    // drawEyesWithCurves(person.landmarks.positions.slice(42, 48)); // Right eye

    function drawBB(person){
        ctx.beginPath();
        ctx.rect(person.detection.box.x, person.detection.box.y, person.detection.box.width, person.detection.box.height);
        ctx.stroke();
    }

    function drawNose(startIndex, endIndex) {
        const start = startIndex;
        const end = endIndex;
        if (start && end) {
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y - 20);
            ctx.stroke();
        }
    }
    function calculateDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function getDistanceBetweenEyes(leftEyePoints, rightEyePoints) {
        if (leftEyePoints.length < 3 || rightEyePoints.length < 3) {
            return 0; // Return 0 if there are not enough points for left or right eye
        }

        // Calculate the distance between the first points of left and right eyes
        const leftEye = leftEyePoints[0];
        const rightEye = rightEyePoints[0];
        return calculateDistance(leftEye, rightEye);
    }
    function drawCurvedEyebrow(points) {
        // Draw a curved line for the eyebrow
        if (points.length >= 3) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);

            for (let i = 1; i < points.length - 1; i++) {
                const xc = (points[i].x + points[i + 1].x) / 2;
                const yc = (points[i].y + points[i + 1].y) / 2;
                ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }

            ctx.quadraticCurveTo(points[points.length - 1].x, points[points.length - 1].y, points[points.length - 1].x, points[points.length - 1].y);
            ctx.stroke();
        }
    }

    function drawMouth(points) {
        // Draw lines and curves for the mouth
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        // Draw lines for the upper lip
        for (let i = 1; i <= 5; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        // Draw curves for the upper lip
        ctx.quadraticCurveTo(points[6].x, points[6].y, points[7].x, points[7].y);
        ctx.quadraticCurveTo(points[8].x, points[8].y, points[9].x, points[9].y);

        // Draw lines for the lower lip
        for (let i = 10; i <= 14; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        // Draw curves for the lower lip
        ctx.quadraticCurveTo(points[15].x, points[15].y, points[16].x, points[16].y);
        ctx.quadraticCurveTo(points[17].x, points[17].y, points[0].x, points[0].y); // Close the path

        let minX = points[0].x;
        let minY = points[0].y;
        let maxX = points[0].x;
        let maxY = points[0].y;

        for (let i = 1; i < points.length; i++) {
            const x = points[i].x;
            const y = points[i].y;

            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }

        // Add padding of 20 to the bounding box
        const padding = 10;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;

        // Calculate the width and height of the bounding box
        // const width = maxX - minX;
        // const height = maxY - minY;
        //
        // // Draw the square around the mouth area
        // ctx.strokeRect(minX, minY, width, height);
        //
        // // Draw lines and curves for the mouth
        // // ctx.beginPath();
        // ctx.moveTo(points[0].x, points[0].y);

        ctx.stroke();
    }

    function drawNoseCurve(landmarks) {
        const noseLeft = landmarks[31]; // Adjust the index based on your landmarks
        const noseCenter = landmarks[33];
        const noseRight = landmarks[35];

        // Draw curve
        ctx.beginPath();
        ctx.moveTo(noseLeft.x, noseLeft.y);
        ctx.bezierCurveTo(noseLeft.x, noseLeft.y, noseCenter.x, noseCenter.y, noseRight.x, noseRight.y);
        ctx.stroke();
    }

    function drawEyesWithCurves(eyePoints) {
        // Draw straight lines for the eyes
        drawLine(eyePoints[0], eyePoints[1]);
        drawLine(eyePoints[1], eyePoints[2]);
        drawLine(eyePoints[2], eyePoints[3]);
        drawLine(eyePoints[3], eyePoints[4]);
        drawLine(eyePoints[4], eyePoints[5]);
        drawLine(eyePoints[5], eyePoints[0]); // Connect the last point to the first to close the shape

        function drawLine(start, end) {
            if (start && end) {
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }
        }


    }
}

function clearPixelCanvas() {
    let canvas = document.getElementById('canvas');
    let pixelCanvas = document.getElementById("pixel-canvas");

    // Check if each canvas element is defined before attempting to clear it
    if (canvas) {
        let canvasCtx = canvas.getContext('2d');
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (pixelCanvas) {
        let pixelCanvasCtx = pixelCanvas.getContext('2d');
        pixelCanvasCtx.clearRect(0, 0, pixelCanvas.width, pixelCanvas.height);
    }
}