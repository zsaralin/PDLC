const contrast = document.getElementById('contrast');

export function applyContrast(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const c = (contrast.value / 100) + 1; // Convert to decimal and shift range: [1..3]
    const intercept = 128 * (1 - c);

    for (let i = 0; i < data.length; i += 4) {
        // Get the RGB values of the pixel
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Apply contrast formula
        data[i] = r * c + intercept;
        data[i + 1] = g * c + intercept;
        data[i + 2] = b * c + intercept;
    }

    // Put the modified image data back on the canvas
    ctx.putImageData(imageData, 0, 0);
}

export function changeContrastWithinArea(canvas, person) {
    const ctx = canvas.getContext('2d');
    const {x,y,width,height} = person.detection.box;
    const imageData = ctx.getImageData(x, y, width, height);
    const data = imageData.data;

    const c = (contrast.value / 100) + 1; // Convert to decimal and shift range: [1..3]
    const intercept = 128 * (1 - c);
    for (let i = 0; i < data.length; i += 4) {
        // Get the RGB values of the pixel
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Apply contrast formula
        data[i] = r * c + intercept;
        data[i + 1] = g * c + intercept;
        data[i + 2] = b * c + intercept;
    }

    // Put the modified image data back on the canvas
    ctx.putImageData(imageData, x, y);
}