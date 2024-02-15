
export let useClahe = true;
let clipLimit = 3;
let tileSize =8;

export function claheFn(canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Create a new OpenCV Mat object from the canvas image data
    const srcMat = cv.imread(canvas);

    // Convert the image to grayscale
    const grayMat = new cv.Mat();
    cv.cvtColor(srcMat, grayMat, cv.COLOR_RGBA2GRAY);

    // Apply CLAHE to the grayscale image if useClahe is true
    const clahe = new cv.CLAHE(clipLimit, new cv.Size(tileSize, tileSize));
    clahe.apply(grayMat, grayMat);
    // Apply Canny edge detection

    // Convert the grayscale Mat back to RGBA
    const resultMat = new cv.Mat();
    cv.cvtColor(grayMat, resultMat, cv.COLOR_GRAY2RGBA);

    // Get the pixel data from the resultMat
    const pixelData = new Uint8ClampedArray(resultMat.data);

    // Update the canvas with the processed pixel data
    const imageData = new ImageData(pixelData, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);

    // Clean up memory
    srcMat.delete();
    grayMat.delete();
    resultMat.delete();
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
}
