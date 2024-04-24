import { updateCanvas } from "./drawROI.js";
import {imgCol, imgRow} from "../dmx/imageRatio.js";
import { getTransformedImageData } from "../UIElements/videoOrientation.js";
import { sendPixelCanvas } from "../twoCam.js";
const pixelatedCanvases = [];
const pixelatedCtxs = [];

createPixelCanv()

function createPixelCanv() {
    for (let i = 0; i < 2; i++) {
        const pixelatedCanvas = document.createElement('canvas');
        const pixelatedCtx = pixelatedCanvas.getContext('2d', { willReadFrequently: true });
        pixelatedCanvas.width = imgCol;
        pixelatedCanvas.height = imgRow;
        pixelatedCanvas.className = 'pixel-off-canvas'; // Assign class name

        pixelatedCanvases.push(pixelatedCanvas);
        pixelatedCtxs.push(pixelatedCtx);
    }

    sendPixelCanvas(pixelatedCanvases);
}

export function updatePixelatedCanvas(filterCanvas, filterCtx, i) {
    pixelatedCanvases[i].width = imgCol;
    pixelatedCanvases[i].height = imgRow;
    const cellWidth = filterCanvas.width / imgCol;
    const cellHeight = filterCanvas.height / imgRow;
    if(!filterCtx || cellWidth <1||  cellHeight < 1 ) return
    pixelatedCtxs[i].drawImage(filterCanvas, 0, 0, pixelatedCanvases[i].width, pixelatedCanvases[i].height);
    const croppedImageData = pixelatedCanvases[i].toDataURL('image/png');
    updateCanvas('pixel-canvas', croppedImageData, i);
}

export function getPixelImageData(i){
    return getTransformedImageData(pixelatedCanvases[i], pixelatedCtxs[i])
}