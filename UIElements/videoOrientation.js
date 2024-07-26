export let angle = 0;
export let mirror0 = true;
export let mirror1 = true;

let mirrorEl0;
let mirrorEl1;
let videoAngle;

export function initializeOrientationControls() {
    mirrorEl0 = document.getElementById('mirrorCheckbox0');
    mirrorEl1 = document.getElementById('mirrorCheckbox1');
    videoAngle = document.getElementById('videoAngle');

    if (mirrorEl0 && mirrorEl1 && videoAngle) {
        // Event listeners for mirror checkboxes
        mirrorEl0.addEventListener('change', () => {
            mirror0 = mirrorEl0.checked;
        });

        mirrorEl1.addEventListener('change', () => {
            mirror1 = mirrorEl1.checked;
        });

        // Event listener for video angle dropdown
        videoAngle.addEventListener('change', () => {
            angle = parseInt(videoAngle.value);
        });
    } else {
        console.error('Orientation control elements not found');
    }
}
