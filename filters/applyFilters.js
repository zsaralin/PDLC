import { grayscaleCanvas } from "./grayscale.js";
import { remapGrayscaleValues } from "./remapGrayscaleValues.js";
import { modifyGrayscale } from "./modifyGrayscale.js";
import { contrastEnhancement } from "./contrastEnh.js";
import { gammaCorrection } from "./gamma.js";
import { applyContrast } from "./contrast.js";
import { claheFn, useClahe } from "./clahe.js";
import { histo, histogramEqualization } from "./histogramEq.js";
import { edge, sharpeningFilter } from "./sharpenFilter.js";
import {sobel, sobelED} from './sobelEdge.js'
import { pixelCanvas } from "./pixelated.js";
import { updateCanvas } from "../drawing/drawROI.js";

const functionOrderList = document.getElementById('functionOrderList');
const grayscaleSlider = document.getElementById('grayscaleSlider');
const grayscaleMapSlider = document.getElementById('grayscaleMapSlider');
const grayscaleExpoSlider = document.getElementById('grayscaleExpoSlider');
const contrastEnhSlider = document.getElementById('contrastEnhSlider');
const contrastSlider = document.getElementById('contrast');
const gammaSlider = document.getElementById('gamma');

const sliders = [
    grayscaleSlider,
    grayscaleMapSlider,
    grayscaleExpoSlider,
    contrastEnhSlider,
    contrastSlider,
    gammaSlider
];

const sliderValues = {};
export function handleSliderChange() {
    sliders.forEach(slider => {
        const id = slider.id;
        if (id === 'gamma' || id === 'contrast') {
            sliderValues[id] = parseInt(slider.value);
        } else {
            const values = slider.noUiSlider.get();
            sliderValues[id] = {
                min: parseFloat(values[0]),
                max: parseFloat(values[1])
            };
        }
    });
}

sliders.forEach(slider => {
    const id = slider.id;
    if (id === 'gamma' || id === 'contrast') {
        slider.addEventListener('change', handleSliderChange)
    } else {
        slider.noUiSlider.on('update', handleSliderChange);
    }
});

handleSliderChange()

export function applyFilters(filterCanvas, filterCtx, person, i) {
    for (const [id, values] of Object.entries(sliderValues)) {
        if (id === 'gamma' || id === 'contrast') {
            if (values !== 1) {
                switch (id) {
                    case 'gamma':
                        gammaCorrection(filterCanvas, 0.5);
                        break;
                    case 'contrast':
                        if (values !== 0) {
                            applyContrast(filterCanvas, person);
                        }
                        break;
                    default:
                        break;
                }
            }
        } else {
            if (values.min !== 0 || values.max !== 255) {
                switch (id) {
                    case 'grayscaleSlider':
                        grayscaleCanvas(filterCanvas);
                        break;
                    case 'grayscaleMapSlider':
                        remapGrayscaleValues(filterCanvas);
                        break;
                    case 'grayscaleExpoSlider':
                        modifyGrayscale(filterCanvas);
                        break;
                    case 'contrastEnhSlider':
                        contrastEnhancement(filterCanvas);
                        break;
                    default:
                        break;
                }
            }
        }
    }

    const croppedGrayscale = filterCanvas.toDataURL('image/png');
    updateCanvas('gray-canvas', croppedGrayscale, i);

    const listItems = functionOrderList.children;

    for (const listItem of listItems) {
        const functionName = listItem.dataset.function;
        switch (functionName) {
            case 'clahe':
                if (useClahe) claheFn(filterCanvas);
                break;
            case 'histoEq':
                if (histo) histogramEqualization(filterCanvas);
                break;
            case 'sharpen':
                if (edge) sharpeningFilter(filterCanvas);
                break;
            case 'sobel':
                if (sobel) sobelED(filterCanvas);
                break;
            default:
                break;
        }
    }

    const croppedImageData = filterCanvas.toDataURL('image/png');
    updateCanvas('cropped-canvas', croppedImageData, i);
    pixelCanvas(filterCanvas, filterCtx, i);
}
