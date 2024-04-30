export let angle = 0;
export let mirror = true;

export function changeOrientation(value = angle) {
    const selectedAngle = parseInt(value);
    const videos = document.querySelectorAll('video'); // Assuming .video-container is the class you want
    let transformation = `rotate(${selectedAngle}deg)`;
    if (mirror) {
        transformation += ' scaleX(-1)';
    }
    videos.forEach(v => {
        v.style.transform = transformation;
    });
    angle = selectedAngle;
}

export function toggleMirror(){
    mirror = document.getElementById('mirrorCheckbox').checked
    changeOrientation()
}


export function rotateCanvas(canvas) {
    // Create a new canvas where the rotated image will be drawn
    const rotatedCanvas = document.createElement('canvas');
    const ctx = rotatedCanvas.getContext('2d');

    // Calculate the new canvas size to accommodate rotation
    const radians = angle * Math.PI / 180;
    const cos = Math.abs(Math.cos(radians));
    const sin = Math.abs(Math.sin(radians));
    rotatedCanvas.width = canvas.height //* cos + canvas.height * sin;
    rotatedCanvas.height = canvas.width * sin + canvas.height * cos;

    // Move the origin to the center of the new canvas to rotate around the center
    ctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
    if (mirror) {
        // If mirroring is desired, scale the context negatively on the x-axis
        ctx.scale(-1, 1);
    }
    // Apply the rotation
    ctx.rotate(radians);
    // Draw the original canvas onto the rotated context
    // Offset by half the width/height to center the image on the canvas
    ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

    return rotatedCanvas;
}
