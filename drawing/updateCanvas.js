import { imgRatio } from "../dmx/imageRatio.js";

let canvas, ctx;
export function initCanvas() {
    canvas = document.querySelector(".pixel-canvas");
    if (canvas) {
        ctx = canvas.getContext("2d");
    }
}

export function updateCanvas(croppedImageData) {
    if (ctx) {
        const img = new Image();
        img.src = croppedImageData;
        img.onload = () => {
            let drawWidth = 100;
            let drawHeight = drawWidth / imgRatio;

            canvas.width = drawWidth;
            canvas.height = drawHeight;

            ctx.drawImage(img, 0, 0, drawWidth, drawHeight);
        };
    } else{
        initCanvas()
    }
}

