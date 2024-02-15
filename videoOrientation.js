let angle = 0;
export let mirror = true;
export function changeOrientation(value = angle) {
    const selectedAngle = parseInt(value);
    const video = document.getElementById('video-container');
    const croppedCanvas = document.getElementById('cropped-canvas');
    const pixelCanvas = document.getElementById('pixel-canvas');
    const grayCanvas = document.getElementById('gray-canvas');
    const button = document.getElementById('playPauseButton');

    if (video) {
        let transformation = `rotate(${selectedAngle}deg)`;

        if (mirror) {
            transformation += ' scaleX(-1)';
        }

        video.style.transform = transformation;

    }

    if (croppedCanvas) {
        croppedCanvas.style.transform = video.style.transform;
    }
    if (pixelCanvas) {
        pixelCanvas.style.transform = video.style.transform;
    }
    if(grayCanvas){
        grayCanvas.style.transform = video.style.transform;
    }

    // if(button){
    //     button.style.transform = video.style.transform;
    // }

    angle = selectedAngle;
}
export function toggleMirror(){
    mirror = !mirror;
    changeOrientation()
}


