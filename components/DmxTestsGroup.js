export class DMXTestsGroup {
    constructor() {
        this.dmxTestsGroupHtml = `
            <div class="group">
                <div class="group-header">DMX Tests <span class="toggle-button">+</span></div>
                <div class="group-content">
                    <label><input type="checkbox" id="screensaver">Screensaver</label>
                    <div id="speedRadial" min="1" max="500" step="1" lowValue="5" highValue="15" label="Radial Speed"></div>
                    <label><input type="checkbox" id="blackScreen">Black Screen</label>
                    <label><input type="checkbox" id="whiteScreen">White Screen</label>
                    <label><input type="checkbox" id="grayScreen">Gray Screen</label>
                    <label><input type="checkbox" id="fadeScreen">Fade Screen</label>
                    <div id="fadeSpeed" min="0" max="100" step="1" value="5" label="Fade Speed"></div>
                    <div id="grayShade" min="0" max="255" step="1" value="255" label="Shade"></div>
                    <label><input type="checkbox" id="linearGrad">Linear Gradient</label>
                    <div id="animSpeed" min="5" max="200" step="5" value="90" label="Linear Speed (ms)"></div>
                    <label><input type="checkbox" id="pixelMover">Pixel Mover</label>
                </div>
            </div>
        `;
    }

    appendTo(parentElement) {
        parentElement.insertAdjacentHTML('beforeend', this.dmxTestsGroupHtml);
    }
}
