import {updateDMXGrid} from "./dmxGrid.js";
import {imgCol, imgRow} from "../imageRatio.js";
import {SERVER_URL} from '../config.js'

export async function setDMXFromPixelCanvas(imageData) {
    let brightnessValues = [];
    const data = imageData.data;
    const imageWidth = imageData.width; // Actual width of the imageData
    const cols = imgCol; // First 10 columns
    const rows = imgRow; // First 28 rows

// Loop through each row and column within the specified grid size
    for (let row = 0; row < rows; row++) {
        let rowBrightness = []; // Array to store brightness values for the current row
        for (let col = 0; col < cols; col++) {
            const index = (row * imageWidth + col) * 4; // Adjust index for RGBA
            const red = data[index];
            const green = data[index + 1];
            const blue = data[index + 2];
            const brightness = 0.299 * red + 0.587 * green + 0.114 * blue;
            rowBrightness.push(brightness);
        }
        brightnessValues.push(rowBrightness); // Push the array of brightness values for this row
    }
    updateDMXGrid(brightnessValues);
        fetch(`${SERVER_URL}/set-dmx`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                dmxValues: brightnessValues // Your DMX values here
            })
        })
            .then(response => response.json())
            .catch(error => console.error('Error:', error));

}

