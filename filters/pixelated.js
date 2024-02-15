import { updateCanvas } from "../filteredCanvas.js";
import {setDMXFromPixelCanvas} from "../dmx.js";

const roi = document.getElementById("roi");
let lastUpdateTime = performance.now();
let frameCount = 0;
let fpsDisplay = document.getElementById('fps-display'); // Add an element to display FPS

export function pixelCanvas(filterCanvas, filterCtx) {
    const pixelatedCanvas = document.createElement('canvas');
    pixelatedCanvas.width = roi.value;
    pixelatedCanvas.height = roi.value;
    const pixelatedCtx = pixelatedCanvas.getContext('2d', { willReadFrequently: true });

    const gridWidth = 30;
    const gridHeight = 28;
    const cellWidth = filterCanvas.width / gridWidth;
    const cellHeight = filterCanvas.height / gridHeight;

    // Loop through the grid cells
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            // Calculate the coordinates and dimensions of the current cell
            const cellX = x * cellWidth;
            const cellY = y * cellHeight;
            const cellWidthPx = cellWidth;
            const cellHeightPx = cellHeight;

            // Extract the pixel data from the grayscale canvas for the current cell
            const cellImageData = filterCtx.getImageData(cellX, cellY, cellWidthPx, cellHeightPx);
            const cellData = cellImageData.data;

            // Calculate the average color for the current cell
            let totalR = 0;
            let totalG = 0;
            let totalB = 0;

            for (let i = 0; i < cellData.length; i += 4) {
                totalR += cellData[i];
                totalG += cellData[i + 1];
                totalB += cellData[i + 2];
            }

            const averageR = Math.round(totalR / (cellData.length / 4));
            const averageG = Math.round(totalG / (cellData.length / 4));
            const averageB = Math.round(totalB / (cellData.length / 4));

            // Set the fill style to the average color
            pixelatedCtx.fillStyle = `rgb(${averageR}, ${averageG}, ${averageB})`;

            // Fill the corresponding cell in the pixelated canvas
            pixelatedCtx.fillRect(cellX, cellY, cellWidthPx, cellHeightPx);
            setDMXFromPixelCanvas(pixelatedCanvas)
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

    const croppedImageData = pixelatedCanvas.toDataURL('image/png');

    // Pass the data URL to the updateCroppedCanvas function
    updateCanvas('pixel-canvas', croppedImageData);
}