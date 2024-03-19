export let robert = true;
const robertEdgeStrength = document.getElementById('robEdgeStrength')
const robertSlider = document.getElementById('robertWrapper')
const robertEl = document.getElementById('robert')
robertSlider.style.display = robertEl.checked ? 'block' : 'none';

robertEl.addEventListener('change', () => {
    robert = !robert
    if (!robert) {
        robertSlider.style.display = 'none'; 
    } else {
        robertSlider.style.display = 'block'; 
    }
})

// For Roberts edge strength
const robertsEdgeStrength = document.getElementById("robEdgeStrength");
const robertsEdgeStrengthVal = document.getElementById("robEdgeStrengthVal");
robertsEdgeStrength.addEventListener("input", function() {
    robertsEdgeStrengthVal.textContent = this.value;
});
    // Roberts Cross kernels
    const robertsCrossKernelX = [
        [1, 0],
        [0, -1]
    ];
    
    const robertsCrossKernelY = [
        [0, 1],
        [-1, 0]
    ];


export function robertED(canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    // Get the image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const width = canvas.width;
    const height = canvas.height;
    
    for (let y = 0; y < height - 1; y++) {
        for (let x = 0; x < width - 1; x++) {
            let sumX = 0;
            let sumY = 0;
            // Compute gradients for each color channel, but accumulate them to determine overall edge strength
            for (let c = 0; c < 3; c++) {
                const index = (y * width + x) * 4 + c;

                const pixelGradientX =
                    data[index] * robertsCrossKernelX[0][0] +
                    data[index + 4] * robertsCrossKernelX[0][1] +
                    data[index + width * 4] * robertsCrossKernelX[1][0] +
                    data[index + width * 4 + 4] * robertsCrossKernelX[1][1];
                
                const pixelGradientY =
                    data[index] * robertsCrossKernelY[0][0] +
                    data[index + 4] * robertsCrossKernelY[0][1] +
                    data[index + width * 4] * robertsCrossKernelY[1][0] +
                    data[index + width * 4 + 4] * robertsCrossKernelY[1][1];

                sumX += pixelGradientX;
                sumY += pixelGradientY;
            }

            const gradientMagnitude = Math.sqrt(sumX * sumX + sumY * sumY);

            // Enhance edge by darkening the pixel based on the gradient magnitude
            for (let c = 0; c < 3; c++) {
                const index = (y * width + x) * 4 + c;
                data[index] = Math.max(0, data[index] - robertEdgeStrength.value * gradientMagnitude);
            }
        }
    }

    // Update the canvas with the enhanced image data
    ctx.putImageData(imageData, 0, 0);
}