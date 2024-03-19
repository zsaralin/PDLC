import { updateCanvas } from "../drawing/drawROI.js";
import {setDMXFromPixelCanvas} from "../dmx/dmx.js";
import {imgCol, imgRow} from "../imageRatio.js";
import { getTransformedImageData } from "../UIElements/videoOrientation.js";
import { sendPixelCanvas } from "../twoCam.js";
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
    pixelatedCanvas1.className = 'pixel-off-canvas'; // Assign class name

    pixelatedCanvases.push(pixelatedCanvas1);
    pixelatedCtxs.push(pixelatedCtx1);

    const pixelatedCanvas2 = document.createElement('canvas');
    const pixelatedCtx2 = pixelatedCanvas2.getContext('2d', { willReadFrequently: true });
    pixelatedCanvas2.width = imgCol;
    pixelatedCanvas2.height = imgRow;
    pixelatedCanvas2.className = 'pixel-off-canvas'; // Assign class name

    pixelatedCanvases.push(pixelatedCanvas2);
    pixelatedCtxs.push(pixelatedCtx2);
    sendPixelCanvas(pixelatedCanvases)
}

export function pixelCanvas(filterCanvas, filterCtx, i) {
    pixelatedCanvases[i].width = imgCol;
    pixelatedCanvases[i].height = imgRow;
    const cellWidth = filterCanvas.width / imgCol;
    const cellHeight = filterCanvas.height / imgRow;
    if(!filterCtx || cellWidth <1||  cellHeight < 1 ) return
    pixelatedCtxs[i].drawImage(filterCanvas, 0, 0, pixelatedCanvases[i].width, pixelatedCanvases[i].height);
    const croppedImageData = pixelatedCanvases[i].toDataURL('image/png');
    updateCanvas('pixel-canvas', croppedImageData, i);
    // const imageData = pixelatedCtxs[i].getImageData(0, 0, pixelatedCanvases[i].width, pixelatedCanvases[i].height);

    // setDMXFromPixelCanvas(imageData)
}

export function getPixelImageData(i){
    return getTransformedImageData(pixelatedCanvases[i], pixelatedCtxs[i])
}