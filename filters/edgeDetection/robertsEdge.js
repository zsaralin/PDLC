export let robert = true;
const robertEdgeStrength = document.getElementById('robEdgeStrength')
const robertEl = document.getElementById('robert')
robertEdgeStrength.style.display = robertEl.checked ? 'block' : 'none';

robertEl.addEventListener('change', () => {
    robert = robertEl.checked;
    robertEdgeStrength.style.display = robert ? 'block' : 'none';
})

const robertsEdgeStrength = document.getElementById("robEdgeStrength");
robertsEdgeStrength.addEventListener("input", function() {
    robertsEdgeStrengthVal.textContent = this.value;
});
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

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const width = canvas.width;
    const height = canvas.height;
    
    for (let y = 0; y < height - 1; y++) {
        for (let x = 0; x < width - 1; x++) {
            let sumX = 0;
            let sumY = 0;
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

            for (let c = 0; c < 3; c++) {
                const index = (y * width + x) * 4 + c;
                data[index] = Math.max(0, data[index] - robertEdgeStrength.value * gradientMagnitude);
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
}