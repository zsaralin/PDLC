import { changeOrientation } from "./videoOrientation.js";
import { createRangeSliderComponent } from "./customSliders/rangeSlider.js";
import { createSliderComponent } from "./customSliders/normalSlider.js";
import { updateOuterRoi } from "../drawing/outerRoi.js";
import { handleSliderChange } from "../filters/applyFilters.js";
import { handleGapChange } from "../dmx/dmxGrid.js";

export function setupSidePanel() {
    const sidePanel = document.getElementById("sidePanel");

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
        changeOrientation(video.value);
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

        const video = document.getElementById("videoAngle");
        video.addEventListener("change", handleVideoChange);

        const mirrorCheckbox0 = document.getElementById("mirrorCheckbox0");
        const mirrorCheckbox1 = document.getElementById("mirrorCheckbox1");
        mirrorCheckbox0.addEventListener("change", handleVideoChange);
        mirrorCheckbox1.addEventListener("change", handleVideoChange);
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

    function initializeSortable() {
        const functionOrderList = document.getElementById('functionOrderList');
        Sortable.create(functionOrderList, {
            animation: 150,
            onEnd: () => {
                console.log('List order updated');
            }
        });
    }

    // Initialize the side panel
    toggleSidePanelVisibility();
    initializeEventListeners();
    initializeSliders();
    initializeSortable();
}
