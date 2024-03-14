let angle = 0;
export let mirror = true;

export function changeOrientation(value = angle) {
    const selectedAngle = parseInt(value);
    const videos = document.querySelectorAll('.canvas'); // Assuming .video-container is the class you want
    const canvases = document.querySelectorAll('.canvas-wrapper');
    let transformation = `rotate(${selectedAngle}deg)`;
    if (mirror) {
        transformation += ' scaleX(-1)';
    }
    videos.forEach(v => {
        v.style.transform = transformation;
    });
    canvases.forEach(c => {
        c.style.transform = transformation;
    });
    angle = selectedAngle;
}

export function toggleMirror(){
    mirror = !mirror;
    changeOrientation()
}

export function setOrientationPixelCanvas(canvas){

}

export function getTransformedImageData(canvas, ctx) {
    const width = canvas.width;
    const height = canvas.height;

    // Create a temporary canvas to apply transformations and obtain the modified ImageData.
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = width;
    tempCanvas.height = height;

    // Saving the context state
    tempCtx.save();

    // Set the origin to the center of the canvas for rotation
    tempCtx.translate(width / 2, height / 2);

    // If mirror is true, scale the context by -1 on the x-axis after moving the origin.
    if (!mirror) {
        tempCtx.scale(-1, 1); // This flips the canvas horizontally.
    }

    // Apply rotation if angle is not zero. 
    // Note: The rotation is applied after the mirroring transformation.
    let adjustedAngle = mirror ? 360-angle : angle
    if (angle !== 0) {
        tempCtx.rotate(adjustedAngle * Math.PI / 180); // Convert angle to radians and rotate.
    }

    // Move the origin back to the top-left corner of the canvas.
    tempCtx.translate(-width / 2, -height / 2);

    // Drawing the original canvas content onto the temporary canvas with transformations applied.
    tempCtx.drawImage(canvas, 0, 0);

    // Restoring the context to its original state.
    tempCtx.restore();

    // Extracting the ImageData from the temporary canvas.
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

    // Optionally, clear and update the original canvas with the transformed content.
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(tempCanvas, 0, 0);

    return imageData;
}