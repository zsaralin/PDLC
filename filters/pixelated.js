import { updateCanvas } from "../drawing/drawROI.js";
import {setDMXFromPixelCanvas} from "../dmx/dmx.js";
import {imgCol, imgRow} from "../imageRatio.js";

const roi = document.getElementById("roi");
let lastUpdateTime = performance.now();
let frameCount = 0;
let fpsDisplay = document.getElementById('fps-display'); // Add an element to display FPS

const pixelatedCanvases = [];
const pixelatedCtxs = [];

createPixelCanv()

function createPixelCanv() {
    const pixelatedCanvas1 = document.createElement('canvas');
    const pixelatedCtx1 = pixelatedCanvas1.getContext('2d', { willReadFrequently: true });
    pixelatedCanvas1.width = imgCol;
    pixelatedCanvas1.height = imgRow;

    pixelatedCanvases.push(pixelatedCanvas1);
    pixelatedCtxs.push(pixelatedCtx1);

    const pixelatedCanvas2 = document.createElement('canvas');
    const pixelatedCtx2 = pixelatedCanvas2.getContext('2d', { willReadFrequently: true });
    pixelatedCanvas2.width = imgCol;
    pixelatedCanvas2.height = imgRow;
    pixelatedCanvases.push(pixelatedCanvas2);
    pixelatedCtxs.push(pixelatedCtx2);
}

export function pixelCanvas(filterCanvas, filterCtx, i) {
    pixelatedCanvases[i].width = imgCol;
    pixelatedCanvases[i].height = imgRow;

    const cellWidth = filterCanvas.width / imgCol;
    const cellHeight = filterCanvas.height / imgRow;
    if(!filterCtx || cellWidth <1||  cellHeight < 1 ) return
    // Loop through each cell in the original canvas
    for (let y = 0; y < imgRow; y++) {
        for (let x = 0; x < imgCol; x++) {
            const cellX = Math.floor(x * cellWidth);
            const cellY = Math.floor(y * cellHeight);

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
            pixelatedCtxs[i].fillStyle = `rgb(${Math.round(averageR)}, ${Math.round(averageG)}, ${Math.round(averageB)})`;

            // Draw a single pixel for the cell on the pixelated canvas
            pixelatedCtxs[i].fillRect(x, y, 1, 1);
        }
    }

    const croppedImageData = pixelatedCanvases[i].toDataURL('image/png');
    updateCanvas('pixel-canvas', croppedImageData, i);
    const imageData = pixelatedCtxs[i].getImageData(0, 0, pixelatedCanvases[i].width, pixelatedCanvases[i].height);

    setDMXFromPixelCanvas(imageData)
}
