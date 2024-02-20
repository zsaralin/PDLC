import { updateCanvas } from "../filteredCanvas.js";
import {setDMXFromPixelCanvas} from "../dmx.js";

const roi = document.getElementById("roi");
let lastUpdateTime = performance.now();
let frameCount = 0;
let fpsDisplay = document.getElementById('fps-display'); // Add an element to display FPS

export function pixelCanvas(filterCanvas, filterCtx) {
    const pixelatedCanvas = document.createElement('canvas');
    pixelatedCanvas.width = 30;
    pixelatedCanvas.height = 28;
    const gridWidth = 30; // Number of cells horizontally
    const gridHeight = 28; // Number of cells vertically
    pixelatedCanvas.width = gridWidth;
    pixelatedCanvas.height = gridHeight;
    const pixelatedCtx = pixelatedCanvas.getContext('2d', { willReadFrequently: true });

    const cellWidth = filterCanvas.width / gridWidth;
    const cellHeight = filterCanvas.height / gridHeight;

    // Loop through each cell in the original canvas
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const cellX = x * cellWidth;
            const cellY = y * cellHeight;

            // Extract pixel data for the current cell
            const cellImageData = filterCtx.getImageData(cellX, cellY, cellWidth, cellHeight);
            const cellData = cellImageData.data;

            // Calculate the average color of the cell
            let totalR = 0, totalG = 0, totalB = 0;
            for (let i = 0; i < cellData.length; i += 4) {
                totalR += cellData[i];
                totalG += cellData[i + 1];
                totalB += cellData[i + 2];
            }
            const numPixels = cellData.length / 4;
            const averageR = totalR / numPixels;
            const averageG = totalG / numPixels;
            const averageB = totalB / numPixels;

            // Set the fill style to the average color
            pixelatedCtx.fillStyle = `rgb(${Math.round(averageR)}, ${Math.round(averageG)}, ${Math.round(averageB)})`;

            // Draw a single pixel for the cell on the pixelated canvas
            pixelatedCtx.fillRect(x, y, 1, 1);
        }
    }

    // Increment frame count and calculate FPS
    // frameCount++;
    // const currentTime = performance.now();
    // const elapsedTime = currentTime - lastUpdateTime;
    // if (elapsedTime >= 1000) {
    //     const fps = Math.round((frameCount * 1000) / elapsedTime);
    //     fpsDisplay.textContent = `FPS: ${fps}`;
    //     frameCount = 0;
    //     lastUpdateTime = currentTime;
    // }

    // Calculate the increment of lightness for each row
    // for (let row = 0; row < pixelatedCanvas.height; row++) {
    //     // Check if the row is even (black) or odd (white)
    //     pixelatedCtx.fillStyle = row %2 ===0 ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)';
    //     pixelatedCtx.fillRect(0, row, pixelatedCanvas.width, 1); // Fill each row with black or white
    // }

    // for (let row = 0; row < pixelatedCanvas.height; row++) {
    //     for (let col = 0; col < pixelatedCanvas.width; col++) {
    //         // Default to white
    //         pixelatedCtx.fillStyle = 'rgb(255, 255, 255)';
    //
    //         // Check for the section where the column is greater than 20 and less than 30
    //         if (col > 20 && col < 30) {
    //             // Calculate the slope for the diagonal line
    //             let slope = pixelatedCanvas.height / 5; // Adjust based on the desired angle and section width
    //
    //             // Draw a diagonal line
    //             if (row === Math.round((col - 21) * slope)) {
    //                 pixelatedCtx.fillStyle = 'rgb(0, 0, 0)'; // Set color to black for the line
    //             }
    //         }
    //
    //         pixelatedCtx.fillRect(col, row, 1, 1); // Fill each pixel with the determined color
    //     }
    // }
// Draw face
//     for (let row = 0; row < 28; row++) {
//         for (let col = 0; col < 30; col++) {
//             pixelatedCtx.fillStyle = 'white';
//             pixelatedCtx.fillRect(col * 1, row * 1, 1, 1);
//         }
//     }
//
// // Draw eyes
//     for (let row = 10; row < 13; row++) {
//         for (let col = 10; col < 13; col++) {
//             pixelatedCtx.fillStyle = 'black';
//             pixelatedCtx.fillRect(col * 1, row * 1, 1, 1);
//         }
//     }
//
//     for (let row = 10; row < 13; row++) {
//         for (let col = 16; col < 19; col++) {
//             pixelatedCtx.fillStyle = 'black';
//             pixelatedCtx.fillRect(col * 1, row * 1, 1, 1);
//         }
//     }
//
// // Draw mouth
//     for (let row = 17; row < 19; row++) {
//         for (let col = 0; col < 30; col++) {
//             pixelatedCtx.fillStyle = 'black';
//             pixelatedCtx.fillRect(col * 1, row * 1, 1, 1);
//         }
//     }
    const croppedImageData = pixelatedCanvas.toDataURL('image/png');

    // Pass the data URL to the updateCroppedCanvas function
    updateCanvas('pixel-canvas', croppedImageData);
    const imageData = pixelatedCtx.getImageData(0, 0, pixelatedCanvas.width, pixelatedCanvas.height);

    setDMXFromPixelCanvas(imageData)

}