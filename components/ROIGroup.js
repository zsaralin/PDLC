export class ROIGroup {
    constructor() {
        this.roiGroupHtml = `
            <div class="group">
                <div class="group-header">ROI <span class="toggle-button">+</span></div>
                <div class="group-content">
                    <div id="roiX" min="0.1" max="10" step=".1" value="1" label="ROI x"></div>
                    <div id="roiY" min="0.1" max="10" step=".1" value="1" label="ROI y"></div>

                    <div id="roiXOffset0" min="-2" max="2" step=".01" value=".1" label="ROI X offset 0"></div>
                    <div id="roiYOffset0" min="-2" max="2" step=".01" value="0" label="ROI Y offset 0 "></div>
                    <div id="roiXOffset1" min="-2" max="2" step=".01" value=".0" label="ROI X offset 1"></div>
                    <div id="roiYOffset1" min="-2" max="2" step=".01" value="0" label="ROI Y offset 1"></div>
                    <div id="stretchX" min="0.1" max="10" step=".1" value="1" label="Stretch x"></div>
                    <div id="stretchY" min="0.1" max="10" step=".1" value="1" label="Stretch y"></div>

                    <label>
                        <input type="checkbox" id="outerRoi"> Show Outer ROI
                    </label>
                    <div id="outerROIWidth" min="0" max="1000" step="1" value="500" label="Outer ROI Width"></div>
                    <div id="outerROIHeight" min="0" max="1000" step="1" value="500" label="Outer ROI Height"></div>
                </div>
            </div>
        `;
    }

    appendTo(parentElement) {
        parentElement.insertAdjacentHTML('beforeend', this.roiGroupHtml);
    }
}
