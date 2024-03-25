export let angle = 0;
export let mirror = true;

export function changeOrientation(value = angle) {
    
    const selectedAngle = parseInt(value);
    const videos = document.querySelectorAll('video'); // Assuming .video-container is the class you want
    const canvases = document.querySelectorAll('.canvas'); // Assuming .video-container is the class you want
    const canvasWrappers = document.querySelectorAll('.canvas-wrapper');
    let transformation = `rotate(${selectedAngle}deg)`;
    if (mirror) {
        transformation += ' scaleX(-1)';
    }
    videos.forEach(v => {
        v.style.transform = transformation;
    });
    // canvases.forEach(v => {
    //     v.style.transform = transformation;
    // });
    // canvasWrappers.forEach(c => {
    //     c.style.transform = transformation;
    // });
    angle = selectedAngle;
}

export function toggleMirror(){
    mirror = !mirror;
    changeOrientation()
}

export function getTransformedImageData(canvas, ctx) {
    // const width = canvas.width;
    // const height = canvas.height;

    // // Create a temporary canvas to apply transformations and obtain the modified ImageData.
    // const tempCanvas = document.createElement('canvas');
    // const tempCtx = tempCanvas.getContext('2d');
    // tempCanvas.width = width;
    // tempCanvas.height = height;

    // // Saving the context state
    // tempCtx.save();

    // // Set the origin to the center of the canvas for rotation
    // tempCtx.translate(width / 2, height / 2);

    // // Apply rotation if angle is not zero.
    // // Note: The rotation is applied after the mirroring transformation.
    // if (angle !== 0) {
    //     let adjustedAngle = mirror ? -angle : angle; // Adjust the angle based on mirroring
    //     tempCtx.rotate(adjustedAngle * Math.PI / 180); // Convert angle to radians and rotate.
    // }

    // // If mirror is true, scale the context by -1 on the x-axis after moving the origin.
    

    // tempCtx.translate(-width / 2, -height / 2);

    // // Draw the original canvas onto the temporary canvas with transformations applied
    // tempCtx.drawImage(canvas, 0, 0);

    // // Restore the context state
    // tempCtx.restore();

    // Get the ImageData from the temporary canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    return imageData;
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
