export let sobel = false;
const sobelEdgeStrength = document.getElementById('sobEdgeStrength')
const sobelSlider = document.getElementById('sobelWrapper')
const sobelEl = document.getElementById('sobel')
sobelSlider.style.display = sobelEl.checked ? 'block' : 'none';

sobelEl.addEventListener('change', () => {
    sobel = !sobel
    if (!sobel) {
        sobelSlider.style.display = 'none'; 
    } else {
        sobelSlider.style.display = 'block'; 
    }
})

const sobelEdgeStrengthVal = document.getElementById("sobEdgeStrengthVal");
sobelEdgeStrength.addEventListener("input", function() {
    sobelEdgeStrengthVal.textContent = this.value;
});
// Apply edge enhancement filter with Sobel operator
const sobelHorizontalKernel = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
];

const sobelVerticalKernel = [
    [-1, -2, -1],
    [ 0,  0,  0],
    [ 1,  2,  1]
];

export function sobelED(canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    // Get the image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    // Create a copy of the image data to work on
    const copyData = new Uint8ClampedArray(data);

    const width = canvas.width;
    const height = canvas.height;

    for (let y = 1; y < height - 1; y+=1) {
        for (let x = 1; x < width - 1; x+=1) {
            for (let c = 0; c < 3; c++) {
                let sumX = 0;
                let sumY = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const index = ((y + ky) * width + (x + kx)) * 4 + c;
                        sumX += copyData[index] * sobelHorizontalKernel[ky + 1][kx + 1];
                        sumY += copyData[index] * sobelVerticalKernel[ky + 1][kx + 1];
                    }
                }
                const gradientMagnitude = Math.sqrt(sumX * sumX + sumY * sumY);
                // Adjust the brightness of the pixel based on the gradient magnitude
                const adjustedBrightness = data[(y * width + x) * 4 + c] - sobelEdgeStrength.value * gradientMagnitude;
                data[(y * width + x) * 4 + c] = Math.max(0, Math.min(255, adjustedBrightness));
            
        
    
            }
        }
    }

    // Update the canvas with the enhanced image data
    ctx.putImageData(imageData, 0, 0);
}
