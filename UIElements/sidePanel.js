import {toggleHisto} from "../filters/histogramEq.js";
import {changeOrientation, toggleMirror} from "./videoOrientation.js";
import {toggleCenter} from "../drawing/drawROI.js";
import {initClahe} from "../filters/clahe.js";
import {initEdge, toggleSharpFilter} from '../filters/sharpenFilter.js'
import {toggleBgSeg} from "../drawing/bgSeg.js";
import {toggleAutoEV} from "../cameraFilters/autoExposure.js";
import {initMinDistSlider} from "../drawing/minEyeDist.js";
import {initCamFilters} from "../cameraFilters/camFilters.js";
import {setNumCol} from "../imageRatio.js";
export function setupSidePanel() {
    const openPanelButton = document.getElementById("openPanelButton");
    const closePanelButton = document.getElementById("closePanelButton");
    const sidePanel = document.getElementById("sidePanel");
    const histogramEqCheckbox = document.getElementById("histogramEqCheckbox"); // Get the checkbox element
    const video = document.getElementById("videoAngle"); // Get the checkbox element
    const mirrorCheckbox = document.getElementById("mirrorCheckbox"); // Get the checkbox element
    const centerFace = document.getElementById("faceCentered"); // Get the checkbox element
    const edge = document.getElementById("edge"); // Get the checkbox element
    const bgSeg = document.getElementById("bgSeg"); // Get the checkbox element

    const autoEV = document.getElementById("autoEV"); // Get the checkbox element

    openPanelButton.addEventListener("click", function () {
        sidePanel.classList.add("open");
        openPanelButton.style.display = "none"; // Hide the open button
        closePanelButton.style.display = "block"; // Show the close button
    });

    closePanelButton.addEventListener("click", function () {
        sidePanel.classList.remove("open");
        openPanelButton.style.display = "block"; // Show the open button
        closePanelButton.style.display = "none"; // Hide the close button
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

    const roi = document.getElementById("roi"); // Get the checkbox element
    const roiValue = document.getElementById("roiValue");

    roi.addEventListener("input", function () {
        roiValue.textContent = this.value;
    });

    const roiXOffset = document.getElementById("roiXOffset");
    const roiXOffsetVal = document.getElementById("roiXOffsetVal");
    roiXOffset.addEventListener("input", function() {
        roiXOffsetVal.textContent = this.value;
    });
    const roiYOffset = document.getElementById("roiYOffset");
    const roiYOffsetVal = document.getElementById("roiYOffsetVal");
    roiYOffset.addEventListener("input", function() {
        roiYOffsetVal.textContent = this.value;
    });

    const contrast = document.getElementById("contrast");
    const contrastVal = document.getElementById("contrastValue");
    contrast.addEventListener("input", function() {
        contrastVal.textContent = this.value;
    });

    const edgeStrength = document.getElementById("sobEdgeStrength");
    const edgeStrengthVal = document.getElementById("sobEdgeStrengthVal");
    edgeStrength.addEventListener("input", function() {
        edgeStrengthVal.textContent = this.value;
    });

    var dmxGridElements = document.querySelectorAll('.dmxGrid');

    const gap = document.getElementById("gap");
    const gapVal = document.getElementById("gapValue");
    gap.addEventListener("input", function() {
        const newCol = this.value
        gapVal.textContent = newCol;
        setNumCol(30+parseInt(newCol))
        dmxGridElements.forEach(function(element) {
            element.style.margin = newCol*2 + 'px'; // Adjust the value as needed
        });
    });


    const lag = document.getElementById("lag");
    const lagVal = document.getElementById("lagVal");
    lag.addEventListener("input", function() {
        lagVal.textContent = this.value;

    });


    centerFace.addEventListener("change", function () {
        toggleCenter()
    });

    edge.addEventListener("change", function () {
        toggleSharpFilter()
    });
    const bgColContainer = document.getElementById('bgColContainer');

    bgSeg.addEventListener("change", function () {
        toggleBgSeg()
        if (this.checked) {
            bgColContainer.style.display = 'block';
        } else {
            bgColContainer.style.display = 'none';
        }
    });

    autoEV.addEventListener("change", function () {
        toggleAutoEV()
    });

    const bgColour = document.getElementById("bg");
    const bgValue = document.getElementById("bgValue");
    bgColour.addEventListener("input", function() {
        bgValue.textContent = this.value;
    });

    const gamm = document.getElementById("gamma");
    const gammVal = document.getElementById("gammValue");
    gamm.addEventListener("input", function() {
        gammVal.textContent = this.value;
    });

    initClahe()
    initEdge()
    initMinDistSlider()
    initCamFilters()
}

// Function to enable or disable histogram equalization based on the checkbox state
