import {toggleHisto} from "../filters/histogramEq.js";
import {changeOrientation, toggleMirror} from "./videoOrientation.js";
import {toggleCenter} from "../drawing/drawROI.js";
import {initClahe} from "../filters/clahe.js";
import {toggleBgSeg} from "../drawing/bgSeg.js";
import {initCamFilters} from "../cameraFilters/camFilters.js";
import {setNumCol} from "../imageRatio.js";
import { createSliderComponent } from "./customSlider.js";
import { updateOuterRoi } from "../drawing/outerRoi.js";
import { createRangeSliderComponent } from "./rangeSlider.js";
import { handleSliderChange } from "../filters/applyFilters.js";
export function setupSidePanel() {
    const sidePanel = document.getElementById("sidePanel");
    sidePanel.style.display = sidePanel.style.display === 'block' ? 'none' : 'block';

    document.addEventListener('keypress', function(event) {
        // Check if the 'g' key was pressed
        if (event.key === 'g') {
            sidePanel.style.display = sidePanel.style.display === 'block' ? 'none' : 'block';
        }
    });

    const groupHeaders = document.querySelectorAll('.group-header');

    groupHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling; // Assuming the content follows the header
            const button = this.querySelector('.toggle-button'); // Find the toggle button within the header
    
            if (content.style.display === 'block') {
                content.style.display = 'none';
                button.textContent = '+';
            } else {
                content.style.display = 'block';
                button.textContent = '-';
            }
        });
    });

    const closePanelButton = document.getElementById("closePanelButton");
    const histogramEqCheckbox = document.getElementById("histogramEqCheckbox"); // Get the checkbox element
    const video = document.getElementById("videoAngle"); // Get the checkbox element
    const mirrorCheckbox = document.getElementById("mirrorCheckbox"); // Get the checkbox element
    const centerFace = document.getElementById("faceCentered"); // Get the checkbox element
    const edge = document.getElementById("edge"); // Get the checkbox element
    const bgSeg = document.getElementById("bgSeg"); // Get the checkbox element

    const autoEV = document.getElementById("autoEV"); // Get the checkbox element

    closePanelButton.addEventListener("click", function () {
        sidePanel.style.display = sidePanel.style.display === 'block' ? 'none' : 'block';
    });

    histogramEqCheckbox.addEventListener("change", function () {
        toggleHisto()
    });

    mirrorCheckbox.addEventListener("change", function () {
        toggleMirror()
    });

    video.addEventListener("change", function () {
        const selectedAngle = parseInt(video.value);
        changeOrientation(selectedAngle)
    });


    const contrast = document.getElementById("contrast");
    const contrastVal = document.getElementById("contrastValue");
    contrast.addEventListener("input", function() {
        contrastVal.textContent = this.value;
    });

    var dmxGridElements = document.querySelectorAll('.dmxGrid');

    centerFace.addEventListener("change", function () {
        toggleCenter()
    });

    const bg = document.getElementById('bg');

    bgSeg.addEventListener("change", function () {
        toggleBgSeg()
        if (this.checked) {
            bg.style.display = 'block';
        } else {
            bg.style.display = 'none';
        }
    });

    const gamm = document.getElementById("gamma");
    const gammVal = document.getElementById("gammValue");
    gamm.addEventListener("input", function() {
        gammVal.textContent = this.value;
    });

    createSliderComponent('gap', function(newCol) {
        setNumCol(30 + parseInt(newCol, 10));
        dmxGridElements.forEach(function(element) {
            element.style.margin = `${newCol * 2}px`; // Adjust the value as needed
        });
    });
    createSliderComponent('pixelSmooth')

    createSliderComponent('bg', )
    createSliderComponent('minEyeDist', )
    createSliderComponent('centeringSpeed', )
    createSliderComponent('centeringLeeway', )

    createSliderComponent('exposureComp', )
    createSliderComponent('exposureTime', )
    createSliderComponent('roi', )
    createSliderComponent('roiXOffset', )
    createSliderComponent('roiYOffset', )
    createSliderComponent('outerROIWidth', updateOuterRoi)
    createSliderComponent('outerROIHeight', updateOuterRoi)

    createSliderComponent('fadeDur', )
    createSliderComponent('switchDur', )
    createSliderComponent('pauseDur', )

    createSliderComponent('clipLimit', )
    createSliderComponent('tileSize', )
    createSliderComponent('contrast', )
    createSliderComponent('gamma', )
    createSliderComponent('edgeStrength', )
    createSliderComponent('sobEdgeStrength', )
    createSliderComponent('robEdgeStrength', )
    createSliderComponent('grayExpo', )

    createSliderComponent('animSpeed', )

    createSliderComponent('camBrightness', )
    createSliderComponent('camContrast', )
    createSliderComponent('camSaturation', )
    createSliderComponent('camSharpness', )
    createSliderComponent('camGain', )
    createSliderComponent('camBacklight', )
    createSliderComponent('colourTemp', )

    createRangeSliderComponent('brightnessRange', )
    createRangeSliderComponent('grayscaleSlider',handleSliderChange )
    createRangeSliderComponent('grayscaleMapSlider', handleSliderChange)
    createRangeSliderComponent('grayscaleExpoSlider',handleSliderChange )
    createRangeSliderComponent('contrastEnh', handleSliderChange)

    initClahe()
    initCamFilters()
}

// Function to enable or disable histogram equalization based on the checkbox state
