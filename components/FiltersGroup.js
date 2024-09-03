export class FiltersGroup {
    constructor() {
        this.filtersGroupHtml = `
            <div class="group">
                <div class="group-header">Filters <span class="toggle-button">+</span></div>
                <div class="group-content">
                    <input type="checkbox" id="autoBrightness"> Auto Brightness
                    <div id="targetBrightness" min="0" max="255" step="1" value="0" label="Target Brightness"></div>

                    <label>
                        <input type="checkbox" id="histogramEqCheckbox"> Histogram Eq
                    </label>
                    <label>
                        <input type="checkbox" id="clahe" checked> Clahe
                    </label>
                    <div id="clahe-sliders">
                        <div id="clipLimit" min="1" max="10" step=".1" value="3" label="Clip Limit"></div>
                        <div id="tileSize" min="1" max="64" step="4" value="8" label="Tile Size"></div>
                    </div>
                    <label>
                        <input type="checkbox" id="edge"> Sharpening Filter
                    </label>
                    <div id="edgeStrength" min="0" max="1" step=".1" value=".5" label="Edge Strength"></div>
                    <label>
                        <input type="checkbox" id="sobel"> Sobel Edge Detection
                    </label>
                    <div id="sobEdgeStrength" min="0" max="1" step=".1" value=".1" label="Edge Strength"></div>
                    <label>
                        <input type="checkbox" id="robert"> Robert Edge Detection
                    </label>
                    <div id="robEdgeStrength" min="0" max="1" step=".1" value=".1" label="Edge Strength"></div>
                    <div id="contrast" min="-100" max="100" step="1" value="0" label="Contrast"></div>
                    <div id="gamma" min="0" max="2" step=".1" value="1" label="Gamma"></div>
                    <div id="brightness" min="-255" max="255" step="1" value="-255" label="Brightness"></div>
                    <div id="grayscaleSlider" min="0" max="255" step="1" lowValue="0" highValue="255" label="Grayscale Range"></div>
                    <div id="grayscaleMapSlider" min="0" max="255" step="1" lowValue="105" highValue="255" label="GR (with remap)"></div>
                    <div id="grayscaleExpoSlider" min="0" max="255" step="1" lowValue="0" highValue="255" label="GR (with expo)"></div>
                    <div id="grayExpo" min="1" max="3" step="1" value="1" label="Expo"></div>
                    <div id="contrastEnh" min="0" max="255" step="1" lowValue="0" highValue="255" label="Contrast Enhancement"></div>
                    <div id="gaussianBlur" min="0" max="10" step=".1" value="4" label="Gaussian Blur"></div>
                    <div id="gaussianMultiple" min="0" max="10" step="1" value="2" label="Gaussian Multiple"></div>

                    </label>

                <label>Filter Order:</label>
                <ul id="functionOrderList">
                    <li data-function="brightness">Brightness</li>
                    <li data-function="contrast">Contrast</li>
                    <li data-function="histoEq">Histogram Eq</li>
                    <li data-function="clahe">CLAHE</li>
                    <li data-function="sharpen">Sharpen</li>
                    <li data-function="sobel">Sobel</li>
                    <li data-function="robert">Robert</li>
                </ul>
            </div>
        `;
    }

    appendTo(parentElement) {
        parentElement.insertAdjacentHTML('beforeend', this.filtersGroupHtml);
        this.initializeSortable();

    }

    initializeSortable() {
        const functionOrderList = document.getElementById('functionOrderList');
        if (functionOrderList) {
            Sortable.create(functionOrderList, {
                animation: 150,
                onEnd: () => {
                    console.log('List order updated');
                }
            });
        } else {
            console.error('Element with id "functionOrderList" not found.');
        }
    }
}
