import { imgCol, imgRow } from "./imageRatio.js";

const CANVAS_WIDTH = imgCol;
const CANVAS_HEIGHT = imgRow * 1;
const MAX_RADIUS = Math.sqrt(CANVAS_WIDTH ** 1.9 + CANVAS_HEIGHT ** 1.9);

const CIRCLE_CHANGE_PROBABILITY = 0.01; // 1% chance each frame to change circle count
const THREE_CIRCLE_PROBABILITY = 0.005;   // 20% chance for 3 circles when changing
const TWO_CIRCLE_PROBABILITY = 0.009;     // 50% chance for 2 circles when changing

const FADE_DURATION = 2000; // Fade duration in milliseconds (2 seconds)

const getRandomPosition = () => ({
    x: Math.random() * CANVAS_WIDTH,
    y: Math.random() * CANVAS_HEIGHT
});

const getRandomSpeed = (minSpeed, maxSpeed) =>
    Math.random() * (maxSpeed - minSpeed) + minSpeed;

const createCircle = (minSpeed, maxSpeed) => ({
    center: getRandomPosition(),
    speed: getRandomSpeed(minSpeed, maxSpeed),
    gradientOffset: 0,
    direction: 1,
    isComplete: false
});

export function animateRadialGradientSweep(pixelatedCtx) {
    let animationFrameId;
    const slider = document.getElementById('speedRadial');
    const minSpeed = parseFloat(slider.getAttribute('lowValue')) / 100;
    const maxSpeed = parseFloat(slider.getAttribute('highValue')) / 100;

    let circles = [createCircle(minSpeed, maxSpeed)];

    let startTime = null;

    const updateCircle = (circle) => {
        if (circle.direction === 1 && circle.gradientOffset >= MAX_RADIUS) {
            circle.direction = -1;
        }
        if (circle.direction === -1 && circle.gradientOffset <= 0) {
            circle.isComplete = true;
        } else {
            circle.gradientOffset += circle.direction * circle.speed;
            let gradient = pixelatedCtx.createRadialGradient(
                circle.center.x, circle.center.y, 0,
                circle.center.x, circle.center.y, Math.max(circle.gradientOffset, 0)
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            pixelatedCtx.fillStyle = gradient;
            pixelatedCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
    };

    const manageCircleCount = () => {
        if (circles.length === 0) {
            circles.push(createCircle(minSpeed, maxSpeed));
        }
    
        if (Math.random() < CIRCLE_CHANGE_PROBABILITY) {
            const rand = Math.random();
            if (rand < THREE_CIRCLE_PROBABILITY && circles.length < 3) {
                circles.push(createCircle(minSpeed, maxSpeed));
                if (circles.length < 3) circles.push(createCircle(minSpeed, maxSpeed));
            } else if (rand < THREE_CIRCLE_PROBABILITY + TWO_CIRCLE_PROBABILITY && circles.length < 2) {
                circles.push(createCircle(minSpeed, maxSpeed));
            }
        }
    };
    
    const updateGradients = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsedTime = timestamp - startTime;

        if (elapsedTime < FADE_DURATION) {
            const fadeFactor = elapsedTime / FADE_DURATION;
            const grayValue = Math.floor(255 * (1 - fadeFactor));
            const fadeColor = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
            pixelatedCtx.fillStyle = fadeColor;
            pixelatedCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        } else {
            pixelatedCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            pixelatedCtx.fillStyle = 'black';
            pixelatedCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            circles = circles.filter(circle => !circle.isComplete);
            circles.forEach(updateCircle);
            manageCircleCount();
        }

        animationFrameId = requestAnimationFrame(updateGradients);
    };

    animationFrameId = requestAnimationFrame(updateGradients);

    return () => {
        cancelAnimationFrame(animationFrameId);
    };
}
