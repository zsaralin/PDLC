
export let useClahe = true;
let clipLimit = 3;
let tileSize =8;

let clahe //= new cv.CLAHE(clipLimit, new cv.Size(tileSize, tileSize));
let srcMat// = null;
let grayMat// = new cv.Mat();
let resultMat// = new cv.Mat();


export function claheFn(canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    // Reuse or create a new OpenCV Mat object from the canvas image data
    srcMat = cv.imread(canvas);

    // Convert the image to grayscale
    cv.cvtColor(srcMat, grayMat, cv.COLOR_RGBA2GRAY);

    // Apply CLAHE to the grayscale image if useClahe is true
    clahe.apply(grayMat, grayMat);
    cv.cvtColor(grayMat, resultMat, cv.COLOR_GRAY2RGBA);
    // Get the pixel data from the resultMat and update the canvas
    const pixelData = new Uint8ClampedArray(resultMat.data);
    const imageData = new ImageData(pixelData, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
    srcMat.delete()
}

export function initClahe() {
    const claheCheckbox = document.getElementById('clahe');
    const claheSliders = document.getElementById('clahe-sliders');
    const clipLimitSlider = document.getElementById('clip-limit-slider');
    const clipLimitValue = document.getElementById('clip-limit-value');
    const tileSizeSlider = document.getElementById('tile-size-slider');
    const tileSizeValue = document.getElementById('tile-size-value');

    // Add event listeners to the sliders
    clipLimitSlider.addEventListener('input', () => {
        clipLimit = parseFloat(clipLimitSlider.value);
        clipLimitValue.textContent = clipLimit.toFixed(1);
    });

    tileSizeSlider.addEventListener('input', () => {
        tileSize = parseFloat(tileSizeSlider.value);
        tileSizeValue.textContent = `${tileSize}x${tileSize}`;
    });

    // Add event listener to the "Clahe" checkbox
    claheCheckbox.addEventListener('change', () => {
        useClahe = claheCheckbox.checked;
        if (useClahe) {
            claheSliders.style.display = 'block';
        } else {
            claheSliders.style.display = 'none';
        }
    });

     clahe = new cv.CLAHE(clipLimit, new cv.Size(tileSize, tileSize));
     srcMat = null;
     grayMat = new cv.Mat();
     resultMat = new cv.Mat();
}
