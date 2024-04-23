export function createSliderComponent(containerId, onValueChange) {
    const container = document.getElementById(containerId);
    let min = parseFloat(container.getAttribute('min')) ?? 0;
    let max = parseFloat(container.getAttribute('max')) ?? 100;
    let step = parseFloat(container.getAttribute('step')) ?? 1;
    let initialValue = Math.max(min, Math.min(max, parseFloat(container.getAttribute('value')) ?? min));

    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'slider-container';
    container.appendChild(sliderContainer);
    container.value = initialValue 
    const sliderTrack = document.createElement('div');
    sliderTrack.className = 'slider-track';
    sliderContainer.appendChild(sliderTrack);

    const sliderFill = document.createElement('div');
    sliderFill.className = 'slider-fill';
    sliderTrack.appendChild(sliderFill);
    sliderFill.style.width = `${((initialValue - min) / (max - min)) * 100}%`;

    const sliderLabel = document.createElement('div');
    sliderLabel.className = 'slider-label';
    sliderLabel.textContent = container.getAttribute('label') || 'Set Value';
    sliderTrack.appendChild(sliderLabel);

    const numberInput = document.createElement('input');
    numberInput.type = 'number';
    numberInput.className = 'number-input';
    numberInput.value = initialValue;
    numberInput.min = min;
    numberInput.max = max;
    numberInput.step = step;
    sliderContainer.appendChild(numberInput);

    let isDragging = false;
    const calculateValue = (pageX) => {
        const bounds = sliderTrack.getBoundingClientRect();
        const x = pageX - window.scrollX - bounds.left; // Adjust for any scrolling
        const percentage = Math.max(0, Math.min(100, (x / bounds.width) * 100));
        return min + (max - min) * (percentage / 100);
    };

    const updateSlider = (value) => {
        value = Math.round(value / step) * step;
        value = Math.max(min, Math.min(max, value));
        const percentage = ((value - min) / (max - min)) * 100;
        sliderFill.style.width = `${percentage}%`;
        numberInput.value = value.toFixed(2);
        container.value = value 
        
        // Dispatch a custom event notifying that the value has changed
        const event = new CustomEvent('valueChanged', { detail: { value } });
        container.dispatchEvent(event);
        if (onValueChange) {
            onValueChange(value);
        }
    };
    function updateSliderProperties(newValue, newMin, newMax) {
        if (newMin !== undefined) {
            min = newMin;
            numberInput.min = newMin;
        }
        if (newMax !== undefined) {
            max = newMax;
            numberInput.max = newMax;
        }
        if (newValue !== undefined) {
            initialValue = Math.max(min, Math.min(max, newValue));
            updateSlider(initialValue);
        }
    }

    container.updateSliderProperties = updateSliderProperties; 

    sliderTrack.addEventListener('mousedown', function(event) {
        isDragging = true;
        updateSlider(calculateValue(event.pageX));
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp, { once: true });
    });

    const handleMouseMove = (event) => {
        if (isDragging) {
            updateSlider(calculateValue(event.pageX));
        }
    };

    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        isDragging = false;
    };

    numberInput.addEventListener('input', function() {
        updateSlider(parseFloat(this.value));
    });
}
