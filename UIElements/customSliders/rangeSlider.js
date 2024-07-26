export function createRangeSliderComponent(containerId, onValueChange) {
    const container = document.getElementById(containerId);
    const min = parseFloat(container.getAttribute('min')) ?? 0;
    const max = parseFloat(container.getAttribute('max')) ?? 100;
    const step = parseFloat(container.getAttribute('step')) ?? 1;
    let lowValue = parseFloat(container.getAttribute('lowValue')) ?? min;
    let highValue = parseFloat(container.getAttribute('highValue')) ?? max;

    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'slider-container';
    container.appendChild(sliderContainer);

    const sliderTrack = document.createElement('div');
    sliderTrack.className = 'slider-track';
    sliderContainer.appendChild(sliderTrack);

    const sliderRange = document.createElement('div');
    sliderRange.className = 'slider-range';
    sliderTrack.appendChild(sliderRange);

    const sliderLabel = document.createElement('div');
    sliderLabel.className = 'slider-label';
    sliderLabel.textContent = container.getAttribute('label');
    sliderTrack.appendChild(sliderLabel);

    const lowInput = document.createElement('input');
    const highInput = document.createElement('input');
    lowInput.type = 'number';
    highInput.type = 'number';
    lowInput.className = 'number-input';
    highInput.className = 'number-input';
    sliderContainer.appendChild(lowInput);
    sliderContainer.appendChild(highInput);
    lowInput.value = formatNumber(lowValue);
    highInput.value = formatNumber(highValue);

    updateValues(lowValue, highValue);

    sliderTrack.addEventListener('mousedown', function (e) {
        e.preventDefault(); // Prevent any native drag behavior

        const trackRect = sliderTrack.getBoundingClientRect();
        const clickPos = e.clientX - trackRect.left; // Click position relative to the track
        const clickValue = snapToStep(((clickPos / trackRect.width) * (max - min)) + min);

        let isMovingLowHandle = Math.abs(clickValue - lowValue) < Math.abs(clickValue - highValue);

        if (isMovingLowHandle) {
            updateValues(clickValue, highValue);
        } else {
            updateValues(lowValue, clickValue);
        }

        function onMouseMove(event) {
            const newPos = event.clientX - trackRect.left; // New position relative to the track
            const newValue = snapToStep(((newPos / trackRect.width) * (max - min)) + min);

            if (isMovingLowHandle) {
                updateValues(newValue, highValue);
            } else {
                updateValues(lowValue, newValue);
            }
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function updateSliderVisuals() {
        const rangeStart = ((lowValue - min) / (max - min)) * 100;
        const rangeEnd = ((highValue - min) / (max - min)) * 100;

        sliderRange.style.left = `${rangeStart}%`;
        sliderRange.style.width = `${rangeEnd - rangeStart}%`;
    }

    function updateValues(low, high) {
        const newLowValue = Math.max(min, Math.min(high, snapToStep(parseFloat(low))));
        const newHighValue = Math.max(newLowValue, Math.min(max, snapToStep(parseFloat(high))));
        lowValue = newLowValue;
        highValue = newHighValue;

        container.setAttribute('lowValue', newLowValue.toString());
        container.setAttribute('highValue', newHighValue.toString());

        updateSliderVisuals();

        // Update the input fields with the new values
        lowInput.value = formatNumber(lowValue);
        highInput.value = formatNumber(highValue);

        if (onValueChange) {
            onValueChange(lowValue, highValue);
        }
    }

    function snapToStep(value) {
        const snappedValue = Math.round(value / step) * step;
        return parseFloat(snappedValue.toFixed(10)); // Ensure precision for floating-point arithmetic
    }

    lowInput.addEventListener('input', () => {
        updateValues(lowInput.value, highValue);
    });

    highInput.addEventListener('input', () => {
        updateValues(lowValue, highInput.value);
    });

    updateSliderVisuals(); // Initialize the slider visuals
}

function formatNumber(value) {
    return value % 1 === 0 ? value.toString() : value.toFixed(2);
}
