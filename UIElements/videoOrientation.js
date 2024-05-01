export let angle = 0;
export let mirror = true;
const mirrorEl = document.getElementById('mirrorCheckbox')
export function changeOrientation(value ) {
    mirror = mirrorEl.checked;  // Ensure this is set before using in transformation
    angle = parseInt(value); // Update global angle
}