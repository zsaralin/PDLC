export let useClahe = true;

let initialized = false;
let clahe, srcMat, grayMat, resultMat;

function initializeClahe() {
    if (initialized) return;

    const claheCheckbox = document.getElementById('clahe');
    const claheSliders = document.getElementById('clahe-sliders');
    const clipLimit = document.getElementById('clipLimit');
    const tileSize = document.getElementById('tileSize');

    claheCheckbox.addEventListener('change', () => {
        useClahe = claheCheckbox.checked;
        claheSliders.style.display = useClahe ? 'block' : 'none';
    });

    clahe = new cv.CLAHE(clipLimit.value, new cv.Size(tileSize.value, tileSize.value));
    srcMat = null;
    grayMat = new cv.Mat();
    resultMat = new cv.Mat();

    initialized = true;
}

export function claheFn(canvas) {
    initializeClahe();

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    // Reuse or create a new OpenCV Mat object from the canvas image data
    srcMat = cv.imread(canvas);

    // Convert the image to grayscale
    cv.cvtColor(srcMat, grayMat, cv.COLOR_RGBA2GRAY);

    // Apply CLAHE to the grayscale image if useClahe is true
    if (useClahe) {
        clahe.apply(grayMat, grayMat);
        cv.cvtColor(grayMat, resultMat, cv.COLOR_GRAY2RGBA);

        // Get the pixel data from the resultMat and update the canvas
        const pixelData = new Uint8ClampedArray(resultMat.data);
        const imageData = new ImageData(pixelData, canvas.width, canvas.height);
        ctx.putImageData(imageData, 0, 0);
    }

    srcMat.delete();
}
