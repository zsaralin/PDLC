import { imgCol, imgRow } from "./imageRatio.js";

export function animateRadialGradientSweep(pixelatedCtx) {
    const canvasWidth = imgCol;
    const canvasHeight = imgRow * 1;
    const maxRadius = Math.sqrt(canvasWidth ** 2.2 + canvasHeight ** 2.2);

    let gradientOffsets = [];
    let directions = [];
    let animationFrameId;

    const slider = document.getElementById('speedRadial');
    const minSpeed = parseFloat(slider.getAttribute('lowValue')) || 0.5;
    const maxSpeed = parseFloat(slider.getAttribute('highValue')) || 1.5;

    const getRandomCenter = () => ({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight
    });

    const getRandomSpeed = () => Math.random() * (maxSpeed - minSpeed) + minSpeed;

    let centers = [getRandomCenter()];
    let speeds = [getRandomSpeed()];

    centers.forEach(() => {
        gradientOffsets.push(0);
        directions.push(1);
    });

    let lastTime = 0;
    const updateGradients = (currentTime) => {
        if (!lastTime) lastTime = currentTime;
        const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
        lastTime = currentTime;

        pixelatedCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        pixelatedCtx.fillStyle = 'black';
        pixelatedCtx.fillRect(0, 0, canvasWidth, canvasHeight);

        for (let i = centers.length - 1; i >= 0; i--) {
            let gradientOffset = gradientOffsets[i];
            let direction = directions[i];

            if (gradientOffset < 0) {
                gradientOffset = 0;
                direction = 1;
            }

            let gradient = pixelatedCtx.createRadialGradient(
                centers[i].x, centers[i].y, 0,
                centers[i].x, centers[i].y, Math.max(gradientOffset, 0)
            );

            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            pixelatedCtx.fillStyle = gradient;
            pixelatedCtx.fillRect(0, 0, canvasWidth, canvasHeight);

            gradientOffset += direction * speeds[i] * deltaTime * 60; // Adjust for consistent speed

            if (gradientOffset >= maxRadius) {
                direction = -1;
            } else if (gradientOffset <= 0) {
                centers.splice(i, 1);
                speeds.splice(i, 1);
                gradientOffsets.splice(i, 1);
                directions.splice(i, 1);

                const newCircleCount = Math.random() < 0.02 ? 2 : 1;
                for (let j = 0; j < newCircleCount; j++) {
                    if (centers.length < 3) {
                        centers.push(getRandomCenter());
                        speeds.push(getRandomSpeed());
                        gradientOffsets.push(0);
                        directions.push(1);
                    }
                }
            }

            gradientOffsets[i] = gradientOffset;
            directions[i] = direction;
        }

        animationFrameId = requestAnimationFrame(updateGradients);
    };

    animationFrameId = requestAnimationFrame(updateGradients);

    return () => {
        cancelAnimationFrame(animationFrameId);
    };
}