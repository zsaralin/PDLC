import { createRangeSliderComponent } from "./customSliders/rangeSlider.js";
import { createSliderComponent } from "./customSliders/normalSlider.js";
import { updateOuterRoi } from "../drawing/outerRoi.js";
import { handleSliderChange } from "../filters/applyFilters.js";
import { handleGapChange } from "../dmx/dmxGrid.js";
import { FiltersGroup } from "../components/FiltersGroup.js";
import { DMXTestsGroup } from "../components/DmxTestsGroup.js";
import { ROIGroup } from "../components/ROIGroup.js";
import { TwoCameraFadingGroup } from "../components/FadingGroup.js";
import { CameraFiltersGroup } from "../components/CameraFiltersGroup.js";
import { initializeOrientationControls } from "./videoOrientation.js";

export function setupSidePanel() {
    const sidePanelHTML = `
        <div id="sidePanel" class="side-panel">
            <button id="closePanelButton" class="panel-button close-button">&times;</button>
            <label class="checkbox-label"> Camera Orientation
                <select id="videoAngle">
                    <option value="0">0</option>
                    <option value="90">90°</option>
                    <option value="180">180°</option>
                    <option value="270">270°</option>
                </select>
            </label>
            <label>
                <input type="checkbox" id="mirrorCheckbox0" checked> Mirror 0
                <input type="checkbox" id="mirrorCheckbox1"> Mirror 1
            </label>
            <div id="pixelSmoothPerson" min="0.01" max="1" step=".01" value=".4" label="Pixel Smooth Person"></div>
            <div id="pixelSmoothScreensaver" min="0.01" max="1" step=".01" value=".03" label="Pixel Smooth Screensaver"></div>
            <div id="bg" min="-1" max="1" step=".1" value="-1" label="Background Col"></div>
            <div id="fg" min="-1" max="1" step=".1" value="1" label="Foreground Col"></div>
            <div id="minEyeDist" min="0" max="500" step="1" value="20" label="Min Eye Dist"></div>
            <div id="cellSize" min="2" max="50" step="1" value="8" label="Pixel Cell Size"></div>
            <div id="gap" min="0" max="10" step="2" value="2" label="Frame Gap"></div>
            <div id="resetInterval" min="1" max="20" step="1" value="5" label="Reset Interval (min)"></div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', sidePanelHTML);

    const sidePanel = document.getElementById("sidePanel");

    const dmxTestsGroup = new DMXTestsGroup();
    dmxTestsGroup.appendTo(sidePanel);

    const fadingGroup = new TwoCameraFadingGroup();
    fadingGroup.appendTo(sidePanel);

    const filtersGroup = new FiltersGroup();
    filtersGroup.appendTo(sidePanel);

    const cameraFiltersGroup = new CameraFiltersGroup();
    cameraFiltersGroup.appendTo(sidePanel);

    const roiGroup = new ROIGroup();
    roiGroup.appendTo(sidePanel);

    function toggleSidePanelVisibility() {
        sidePanel.style.display = sidePanel.style.display === 'block' ? 'none' : 'block';
    }

    function toggleSidePanel(event) {
        if (event.key === 'g') {
            toggleSidePanelVisibility();
        }
    }

    function toggleGroupContent() {
        const content = this.nextElementSibling;
        const button = this.querySelector('.toggle-button');
        const isExpanded = content.style.display === 'block';

        content.style.display = isExpanded ? 'none' : 'block';
        button.textContent = isExpanded ? '+' : '-';
    }

    function handleVideoChange() {
        // changeOrientation(video.value);
    }

    function updateCellSize() {
        const cellSizeValue = document.getElementById('cellSize').value;
        document.documentElement.style.setProperty('--cell-size', cellSizeValue + 'px');
    }

    function initializeEventListeners() {
        document.addEventListener('keypress', toggleSidePanel);

        const groupHeaders = document.querySelectorAll('.group-header');
        groupHeaders.forEach(header => {
            header.addEventListener('click', toggleGroupContent);
        });

        const closePanelButton = document.getElementById("closePanelButton");
        closePanelButton.addEventListener("click", toggleSidePanelVisibility);
    }

    function initializeSliders() {
        const sliderDivs = document.querySelectorAll('div[id][min][max][step][value][label]');
        const rangeSliderDivs = document.querySelectorAll('div[id][min][max][step][lowValue][highValue][label]');

        const specialCases = {
            'gap': handleGapChange,
            'cellSize': updateCellSize,
            'outerROIWidth': updateOuterRoi,
            'outerROIHeight': updateOuterRoi,
            'contrast': handleSliderChange,
            'gamma': handleSliderChange,
            'brightness': handleSliderChange,
            'grayscaleSlider': handleSliderChange,
            'grayscaleMapSlider': handleSliderChange,
            'grayscaleExpoSlider': handleSliderChange,
            'contrastEnh': handleSliderChange
        };

        sliderDivs.forEach(div => {
            const id = div.id;
            const handler = specialCases[id];
            createSliderComponent(id, handler);
        });

        rangeSliderDivs.forEach(div => {
            const id = div.id;
            const handler = specialCases[id];
            createRangeSliderComponent(id, handler);
        });
    }

    // Initialize the side panel
    toggleSidePanelVisibility();
    initializeEventListeners();
    initializeSliders();
    initializeOrientationControls();
}
