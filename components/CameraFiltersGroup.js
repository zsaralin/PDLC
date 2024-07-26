export class CameraFiltersGroup {
    constructor() {
        this.cameraFiltersGroupHtml = `
            <div class="group">
                <div class="group-header">Camera Filters <span class="toggle-button">+</span></div>
                <div class="group-content">
                <label>
        <input type="checkbox" id="autoEV" > Auto-adjust EV
                </label>
                </label>
                <div id="brightnessRange" min="0" max="255" step="1" lowValue="140" highValue="160" label="Brightness"></div>
                    <div id="exposureModeWrapper">
                        <label for="exposureModeSelect">Exposure Mode:
                            <select id="exposureModeSelect">
                                <option value="manual">Manual</option>
                                <option value="continuous">Continuous</option>
                            </select>
                        </label>
                    </div>
                    <div id="exposureCompWrapper">
                        <div id="exposureComp" min="0" max="255" step="1" value="0" label="EV"></div>
                        <div id="exposureTime" min="0" max="1250" step="1" value="150" label="Exposure t (ms)"></div>
                    </div>
                    <div id="camBrightness" min="-64" max="64" step="1" value="0" label="Cam Brightness"></div>
                    <div id="camContrast" min="0" max="100" step="1" value="100" label="Cam Contrast"></div>
                    <div id="camSaturation" min="0" max="100" step="1" value="50" label="Cam Saturation"></div>
                    <div id="camSharpness" min="0" max="100" step="1" value="71" label="Cam Sharpness"></div>
                    <div id="camGain" min="1" max="128" step="1" value="56" label="Cam Gain"></div>
                    <div id="camBacklight" min="0" max="2" step=".1" value="1" label="Cam Backlight"></div>
                    <div id="whiteBalanceMode">
                        <label for="WhiteBalanceModeSelect">Cam White Balance Mode:</label>
                        <select id="WhiteBalanceModeSelect">
                            <option value="manual">Manual</option>
                            <option value="continuous" selected>Continuous</option>
                        </select>
                    </div>
                    <div id="colourTempContainer" style="display: none;">
                        <div id="colourTemp" min="2800" max="6500" step="50" value="5500" label="Cam Colour Temp"></div>
                    </div>
                </div>
            </div>
        `;
    }

    appendTo(parentElement) {
        parentElement.insertAdjacentHTML('beforeend', this.cameraFiltersGroupHtml);
    }
}
