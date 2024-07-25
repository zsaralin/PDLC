import { grayscaleCanvas } from "./grayscale/grayscale.js";
import { remapGrayscaleLinear } from "./grayscale/remapGrayscaleLinear.js";
import { adjustGrayscaleWithExpo } from "./grayscale/adjustGrayscaleWithExpo.js";
import { contrastEnhancement } from "./contrastEnh.js";
import { gammaCorrection } from "./gamma.js";
import { applyContrast } from "./contrast.js";
import { claheFn, useClahe } from "./clahe.js";
import { histogramEqualization } from "./histogramEq.js";
import { edge, sharpeningFilter } from "./edgeDetection/sharpenFilter.js";
import {sobel, sobelED} from './edgeDetection/sobelEdge.js'
import {robert, robertED} from './edgeDetection/robertsEdge.js'
import { updatePixelatedCanvas } from "../drawing/pixelCanvasUtils.js";
import { updateCanvas } from "../drawing/updateCanvas.js";
import {drawSegmentation} from "../drawing/drawSegmentation.js";
import {appVersion} from "../UIElements/appVersionHandler.js";
import {applyBrightness} from "./brightness.js";
import {adjustSkeletonBrightness} from "./skeletonBrightness.js";

const functionOrderList = document.getElementById('functionOrderList');
const grayscaleSlider = document.getElementById('grayscaleSlider');
const grayscaleMapSlider = document.getElementById('grayscaleMapSlider');
const grayscaleExpoSlider = document.getElementById('grayscaleExpoSlider');
const contrastEnhSlider = document.getElementById('contrastEnh');
const contrastSlider = document.getElementById('contrast');
const gammaSlider = document.getElementById('gamma');
const brightnessSlider = document.getElementById('brightness');

const histo = document.getElementById('histogramEqCheckbox')

const sliders = [
    contrastSlider,
    gammaSlider,
    brightnessSlider,
    grayscaleSlider,
    grayscaleMapSlider,
    grayscaleExpoSlider,
    contrastEnhSlider,
];

const sliderValues = {};
export function handleSliderChange() {
    sliders.forEach(slider => {
        const id = slider.id;
        if (id === 'gamma' || id === 'contrast' || id === 'brightness') {
            sliderValues[id] = parseFloat(slider.value);
        } else {
            sliderValues[id] = {
                min: parseFloat(slider.getAttribute('lowValue')),
                max: parseFloat(slider.getAttribute('highValue'))
            };
        }
    });
}

sliders.forEach(slider => {
    const id = slider.id;
    if (id === 'gamma' || id === 'contrast' || id === 'brightness') {
        slider.addEventListener('change', handleSliderChange)
    } else {
    }
});

handleSliderChange()

export async function applyFilters(filterCanvas, filterCtx, i) {
    for (const [id, values] of Object.entries(sliderValues)) {
        if (id === 'gamma' || id === 'contrast' || id === 'brightness') {
            if (values !== 1) {
                switch (id) {
                    case 'gamma':
                        gammaCorrection(filterCanvas);
                        break;
                    case 'contrast':
                        if (values !== 0) {
                            applyContrast(filterCanvas);
                        }
                        break;
                    case 'brightness':
                        if (values !== 0) {
                            applyBrightness(filterCanvas);
                        }
                        break;
                    default:
                        break;
                }
            }
    }
    else {
            if (values.min !== 0 || values.max !== 255) {
                switch (id) {
                    case 'grayscaleSlider':
                        grayscaleCanvas(filterCanvas);
                        break;
                    case 'grayscaleMapSlider':
                        remapGrayscaleLinear(filterCanvas);
                        break;
                    case 'grayscaleExpoSlider':
                        adjustGrayscaleWithExpo(filterCanvas);
                        break;
                    case 'contrastEnh':
                        contrastEnhancement(filterCanvas);
                        break;
                    default:
                        break;
                }
            }
        }
    // filterCtx.filter = `blur(${gaussianBlur.value}px)`; // Apply a Gaussian blur with a 5-pixel radius
    }

    const listItems = functionOrderList.children;

    for (const listItem of listItems) {
        const functionName = listItem.dataset.function;
        switch (functionName) {
            case 'clahe':
                if (useClahe) claheFn(filterCanvas);
                break;
            case 'histoEq':
                if (histo.checked) histogramEqualization(filterCanvas);
                break;
            case 'sharpen':
                if (edge) sharpeningFilter(filterCanvas);
                break;
            case 'sobel':
                if (sobel) sobelED(filterCanvas);
                break;
            case 'robert':
                if (robert) robertED(filterCanvas);
                break;
            default:
                break;
        }
    }
    updatePixelatedCanvas(filterCanvas, filterCtx, i);
}
