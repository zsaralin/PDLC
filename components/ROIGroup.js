export class ROIGroup {
    constructor() {
        this.roiGroupHtml = `
            <div class="group">
                <div class="group-header">ROI <span class="toggle-button">+</span></div>
                <div class="group-content">
                    <div id="roiX0" min="0" max="10" step=".1" value="1" label="ROI x 0"></div>
                    <div id="roiY0" min="0" max="10" step=".1" value="1" label="ROI y 0"></div>
                    <div id="roiX1" min="0" max="10" step=".1" value="1" label="ROI x 1"></div>
                    <div id="roiY1" min="0" max="10" step=".1" value="1" label="ROI x 1"></div>

                    <div id="roiXOffset0" min="-100" max="100" step="1" value="-65" label="ROI X offset 0"></div>
                    <div id="roiYOffset0" min="-2" max="2" step=".01" value="0" label="ROI Y offset 0 "></div>
                    <div id="roiXOffset1" min="-100" max="100" step=".01" value="-40" label="ROI X offset 1"></div>
                    <div id="roiYOffset1" min="-100" max="2" step="1" value="0" label="ROI Y offset 1"></div>
                    <div id="stretchX" min="0.1" max="10" step=".1" value="1" label="Stretch x"></div>
                    <div id="stretchY" min="0.1" max="10" step=".1" value="1" label="Stretch y"></div>
                    <div id="segmentYOffset0" min="-100" max="100" step="1" value="-12" label="Segment Y offset 0"></div>
                    <div id="segmentYOffset1" min="-100" max="100" step="1" value="-12" label="Segment Y offset 1"></div>
                    <div id="segmentFeather" min="0" max="15" step=".1" value="0" label="Segment Feather"></div>
                    
                    <div id="pushFactor0" min="0" max="50" step="1" value="0" label="Push Factor 0"></div>
                    <div id="pushFactor1" min="0" max="50" step="1" value="0" label="Push Factor 1"></div>

                    <div id="pushLeft" min="0" max="15" step=".1" value="0" label="Push Left (canvas width / x)"></div>
                    <div id="pushRight" min="0" max="15" step=".1" value="0" label="Push Right (canvas width / x)"></div>
                    <div id="armMultiple" min="0" max="10" step="1" value="4" label="Arm Multiple"></div>

                    <label>
                        <input type="checkbox" id="outerRoi"> Show Outer ROI
                    </label>
                    <div id="outerROIWidth" min="0" max="1000" step="1" value="0" label="Outer ROI Width"></div>
                    <div id="outerROIHeight" min="0" max="1000" step="1" value="0" label="Outer ROI Height"></div>
                </div>
            </div>
        `;
    }

    appendTo(parentElement) {
        parentElement.insertAdjacentHTML('beforeend', this.roiGroupHtml);
    }
}
