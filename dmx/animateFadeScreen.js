// Animation functions
export function animateFadeScreen() {
    let fadeValue = 0;
    let fadeDirection = 1;

    const fade = () => {
        const fadeSpeed = parseFloat(document.getElementById('fadeSpeed').value) / 1000;
        fadeValue += fadeDirection * fadeSpeed;

        if (fadeValue >= 1) {
            fadeValue = 1;
            fadeDirection = -1;
        } else if (fadeValue <= 0) {
            fadeValue = 0;
            fadeDirection = 1;
        }

        const color = Math.round(fadeValue * 255);
        fillCanvas(`rgb(${color}, ${color}, ${color})`);
        updateDMX();

        return setTimeout(fade, 20);
    };

    return fade();
}