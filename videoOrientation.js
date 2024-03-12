let angle = 0;
export let mirror = true;

export function changeOrientation(value = angle) {
    const selectedAngle = parseInt(value);
    const videos = document.querySelectorAll('.video-container'); // Assuming .video-container is the class you want
    const croppedCanvases = document.querySelectorAll('.cropped-canvas');
    const pixelCanvases = document.querySelectorAll('.pixel-canvas');
    const grayCanvases = document.querySelectorAll('.gray-canvas');

    let transformation = `rotate(${selectedAngle}deg)`;

    if (mirror) {
        transformation += ' scaleX(-1)';
    }

    // Apply transformation to all video containers
    videos.forEach(video => {
        video.style.transform = transformation;
    });

    // Apply transformation to all cropped canvases
    croppedCanvases.forEach(croppedCanvas => {
        croppedCanvas.style.transform = transformation;
    });

    // Apply transformation to all pixel canvases
    pixelCanvases.forEach(pixelCanvas => {
        pixelCanvas.style.transform = transformation;
    });

    // Apply transformation to all gray canvases
    grayCanvases.forEach(grayCanvas => {
        grayCanvas.style.transform = transformation;
    });

    angle = selectedAngle;
}

export function toggleMirror(){
    mirror = !mirror;
    changeOrientation()
}


