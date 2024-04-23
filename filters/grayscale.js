const slider = document.getElementById('grayscaleSlider')

export function grayscaleCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const lowValue = parseInt(slider.getAttribute('lowValue'), 10);
    const highValue = parseInt(slider.getAttribute('highValue'), 10);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        let average = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
        if (average < lowValue) average = lowValue;
        if (average > highValue) average = highValue;
        average = Math.max(0, Math.min(255, average));

        imageData.data[i] = average;
        imageData.data[i + 1] = average;
        imageData.data[i + 2] = average;
    }
    ctx.putImageData(imageData, 0, 0);
}