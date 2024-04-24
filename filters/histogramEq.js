export function histogramEqualization(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = new Uint8Array(imageData.data.buffer); // Convert to Uint8Array for better performance

    const histogram = new Array(256).fill(0);
    const cdf = new Array(256).fill(0);
    let totalPixels = width * height;

    // Calculate the histogram
    for (let i = 0; i < data.length; i += 4) {
        const intensity = data[i]; // Assuming the image is already grayscale
        histogram[intensity]++;
    }

    // Calculate the cumulative distribution function (CDF)
    cdf[0] = histogram[0];
    for (let i = 1; i < 256; i++) {
        cdf[i] = cdf[i - 1] + histogram[i];
    }

    // Map the intensity values using the CDF
    const scale = 255 / totalPixels;
    for (let i = 0; i < data.length; i += 4) {
        const intensity = data[i];
        const newIntensity = Math.round(cdf[intensity] * scale);
        data[i] = newIntensity;
        data[i + 1] = newIntensity;
        data[i + 2] = newIntensity;
    }

    // Update the canvas with the equalized image data
    ctx.putImageData(new ImageData(new Uint8ClampedArray(data.buffer), width, height), 0, 0);
}