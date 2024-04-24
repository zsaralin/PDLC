
export let edge = false;
export let useEdge = true;

const edgeStrength  = document.getElementById('edgeStrength')
const edgeEl = document.getElementById('edge')
edgeStrength.style.display = edgeEl.checked ? 'block' : 'none';

edgeEl.addEventListener('change', () => {
    edge = edgeEl.checked;
    edgeStrength.style.display = edge ? 'block' : 'none';
})

export function sharpeningFilter(canvas) {
    console.log()
   const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Get the image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Create a copy of the image data to work on
    const copyData = new Uint8ClampedArray(data);

    // Apply edge enhancement filter
    const kernel = [
        [-1, -1, -1],
        [-1,  8, -1],
        [-1, -1, -1]
    ];
    const width = canvas.width;
    const height = canvas.height;

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            for (let c = 0; c < 3; c++) {
                let sum = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const index = ((y + ky) * width + (x + kx)) * 4 + c;
                        sum += copyData[index] * kernel[ky + 1][kx + 1];
                    }
                }
                data[(y * width + x) * 4 + c] = Math.min(255, Math.max(0, copyData[(y * width + x) * 4 + c] + edgeStrength.value * sum));
            }
        }
    }

    // Update the canvas with the enhanced image data
    ctx.putImageData(imageData, 0, 0);
}

