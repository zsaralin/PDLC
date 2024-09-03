import { imgCol, imgRow } from "./imageRatio.js";

const CANVAS_WIDTH = imgCol;
const CANVAS_HEIGHT = imgRow;
const MAX_RADIUS = Math.sqrt(CANVAS_WIDTH ** 2.4 + CANVAS_HEIGHT ** 2.4);

const getRandomPosition = () => ({
    x: Math.random() * CANVAS_WIDTH,
    y: Math.random() * CANVAS_HEIGHT
});

const getRandomSpeed = () => {
    const slider = document.getElementById('speedRadial');
    const minSpeed = parseFloat(slider.getAttribute('lowValue')) / 100;
    const maxSpeed = parseFloat(slider.getAttribute('highValue')) / 100;
    return Math.random() * (maxSpeed - minSpeed) + minSpeed;
};

const createCircle = (color) => ({
    center: getRandomPosition(),
    speed: getRandomSpeed(),
    radius: 0,
    color: color
});

export function animateRadialGradientSweep(pixelatedCtx) {
    let animationFrameId;
    let isFading = false;
    let fadeProgress = 0;
    let currentColor = 'white'; // Start with a white circle
    let circle = createCircle(currentColor);

    const updateCircle = () => {
        if (!isFading) {
            if (circle.radius < MAX_RADIUS) {
                circle.radius += circle.speed; // Increase the radius gradually using the speed
            } else {
                isFading = true;
            }
        }
    };

    const drawCircle = () => {
        let innerRadius = Math.max(circle.radius - 20, 0); // Ensure non-negative inner radius
        let gradient = pixelatedCtx.createRadialGradient(
            circle.center.x, circle.center.y, innerRadius,
            circle.center.x, circle.center.y, circle.radius
        );
        gradient.addColorStop(0, circle.color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        pixelatedCtx.fillStyle = gradient;
        pixelatedCtx.beginPath();
        pixelatedCtx.arc(circle.center.x, circle.center.y, circle.radius, 0, 2 * Math.PI);
        pixelatedCtx.fill();
    };

    const updateFade = () => {
        if (isFading) {
            fadeProgress += 0.01; // Increment fade effect
            if (fadeProgress >= 1) {
                fadeProgress = 0;
                isFading = false;
                currentColor = currentColor === 'white' ? 'black' : 'white';
                circle = createCircle(currentColor); // Create a new circle with the inverted color
            }
        }
    };

    const updateGradients = () => {
        pixelatedCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        pixelatedCtx.fillStyle = currentColor === 'white' ? 'black' : 'white';
        pixelatedCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        drawCircle(); // Draw the current circle
        updateCircle(); // Update the circle's size
        updateFade(); // Handle the fading transition

        animationFrameId = requestAnimationFrame(updateGradients);
    };

    animationFrameId = requestAnimationFrame(updateGradients);

    return () => {
        cancelAnimationFrame(animationFrameId);
    };
}
