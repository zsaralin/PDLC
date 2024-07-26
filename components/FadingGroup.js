export class TwoCameraFadingGroup {
    constructor() {
        this.twoCameraFadingGroupHtml = `
            <div class="group">
                <div class="group-header">Two Camera Fading <span class="toggle-button">+</span></div>
                <div class="group-content">
                    <label class="checkbox-label"> Fade Colour
                        <select id="fadeColour">
                            <option value="black">black</option>
                            <option value="white">white</option>
                        </select>
                    </label>
                    <div id="fadeDur" min="200" max="2000" step="1" value="1000" label="Fade Dur (ms)"></div>
                    <div id="switchDur" min="2" max="30" step="1" value="15" label="Switch Dur (s)"></div>
                    <div id="pauseDur" min=".5" max="5" step=".5" value="1" label="Pause dur (s)"></div>
                </div>
            </div>
        `;
    }

    appendTo(parentElement) {
        parentElement.insertAdjacentHTML('beforeend', this.twoCameraFadingGroupHtml);
    }
}