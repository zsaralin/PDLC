import { changeOrientation } from "./videoOrientation.js";
import { initClahe } from "../filters/clahe.js";
import { initCamFilters } from "../cameraFilters/camFilters.js";
import { setNumCol } from "../dmx/imageRatio.js";
import { createRangeSliderComponent } from "./customSliders/rangeSlider.js";
import { createSliderComponent } from "./customSliders/normalSlider.js";
import { updateOuterRoi } from "../drawing/outerRoi.js";
import { handleSliderChange } from "../filters/applyFilters.js";

export function setupSidePanel() {
    const sidePanel = document.getElementById("sidePanel");
    sidePanel.style.display = sidePanel.style.display === 'block' ? 'none' : 'block';

    document.addEventListener('keypress', toggleSidePanel);

    const groupHeaders = document.querySelectorAll('.group-header');
    groupHeaders.forEach(header => {
        header.addEventListener('click', toggleGroupContent);
    });

    const closePanelButton = document.getElementById("closePanelButton");
    const video = document.getElementById("videoAngle");
    const mirrorCheckbox = document.getElementById("mirrorCheckbox");

    closePanelButton.addEventListener("click", toggleSidePanel);
    mirrorCheckbox.addEventListener("change", handleVideoChange);
    video.addEventListener("change", handleVideoChange);

    createSliderComponent('skeletonBrightness');

    createSliderComponent('gap', handleGapChange);
    createSliderComponent('pixelSmooth');
    createSliderComponent('bg');
    createSliderComponent('minEyeDist');
    createSliderComponent('centeringSpeed');
    createSliderComponent('centeringLeeway');
    createSliderComponent('exposureComp');
    createSliderComponent('exposureTime');
    createSliderComponent('cellSize', updateCellSize);
    createSliderComponent('resetInterval');

    createSliderComponent('roi');
    createSliderComponent('roiXOffset');
    createSliderComponent('roiYOffset');
    createSliderComponent('outerROIWidth', updateOuterRoi);
    createSliderComponent('outerROIHeight', updateOuterRoi);
    createSliderComponent('fadeDur');
    createSliderComponent('switchDur');
    createSliderComponent('pauseDur');
    createSliderComponent('clipLimit');
    createSliderComponent('tileSize');
    createSliderComponent('contrast', handleSliderChange);
    createSliderComponent('gamma', handleSliderChange);
    createSliderComponent('edgeStrength');
    createSliderComponent('sobEdgeStrength');
    createSliderComponent('robEdgeStrength');
    createSliderComponent('gaussianBlur');
    createSliderComponent('grayExpo');
    createSliderComponent('animSpeed');
    createSliderComponent('camBrightness');
    createSliderComponent('camContrast');
    createSliderComponent('camSaturation');
    createSliderComponent('camSharpness');
    createSliderComponent('camGain');
    createSliderComponent('camBacklight');
    createSliderComponent('colourTemp');

    createRangeSliderComponent('brightnessRange');
    createRangeSliderComponent('grayscaleSlider', handleSliderChange);
    createRangeSliderComponent('grayscaleMapSlider', handleSliderChange);
    createRangeSliderComponent('grayscaleExpoSlider', handleSliderChange);
    createRangeSliderComponent('contrastEnh', handleSliderChange);

    initClahe();
    initCamFilters();

    function toggleSidePanel(event) {
        if (event.key === 'g') {
            sidePanel.style.display = sidePanel.style.display === 'block' ? 'none' : 'block';
        }
    }

    function toggleGroupContent() {
        const content = this.nextElementSibling;
        const button = this.querySelector('.toggle-button');
        if (content.style.display === 'block') {
            content.style.display = 'none';
            button.textContent = '+';
        } else {
            content.style.display = 'block';
            button.textContent = '-';
        }
    }

    function handleVideoChange() {
        changeOrientation(video.value);
    }

    function handleGapChange(newCol) {
        const dmxGridElements = document.querySelectorAll('.dmxGrid');
        setNumCol(30 + parseInt(newCol, 10));
        dmxGridElements.forEach(element => {
            element.style.margin = `${newCol * 2}px`;
        });
    }

    function updateCellSize(){
        const cellSize = document.getElementById('cellSize').value
        document.documentElement.style.setProperty('--cell-size', cellSize + 'px');

    }
}
