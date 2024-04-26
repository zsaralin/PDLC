import {imgRatio} from "../dmx/imageRatio.js";

const classNames = ['pixel-canvas', 'gray-canvas', 'cropped-canvas'];
const dict = {};

classNames.forEach(className => {
    const elements = document.querySelectorAll(`.${className}`);
    if (elements.length) {
        dict[className] = Array.from(elements).map(el => el.getContext('2d', {willReadFrequently: 'true'}));
    }
});

export function updateCanvas(canvasId, croppedImageData, i) {
    const ctx = dict[canvasId][i];
    if (ctx) {
        const img = new Image();
        img.src = croppedImageData;
        img.onload = () => {
            let drawWidth = 100;
            let drawHeight = drawWidth / imgRatio;

            ctx.canvas.width = drawWidth;
            ctx.canvas.height = drawHeight;

            ctx.drawImage(img, 0, 0, drawWidth, drawHeight);
        };
    }
}