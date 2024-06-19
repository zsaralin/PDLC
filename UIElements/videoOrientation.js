export let angle = 0;
export let mirror0 = true;
export let mirror1 = true;

const mirrorEl0 = document.getElementById('mirrorCheckbox0')
const mirrorEl1 = document.getElementById('mirrorCheckbox1')

export function changeOrientation(value ) {
    mirror0 = mirrorEl0.checked;  // Ensure this is set before using in transformation
    mirror1 = mirrorEl1.checked;  // Ensure this is set before using in transformation

    angle = parseInt(value); // Update global angle
}