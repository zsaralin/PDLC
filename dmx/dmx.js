import {updateDMXGrid} from "./dmxGrid.js";
import {imgCol, imgRow} from "../imageRatio.js";
import {SERVER_URL} from '../config.js'

let prevBrightnessValues = Array.from({length: imgRow}, () => Array(imgCol).fill(0));

export async function setDMXFromPixelCanvas(imageData) {
    let brightnessValues = [];
    const data = imageData.data;
    const imageWidth = imageData.width; // Actual width of the imageData
    const cols = imgCol; // First 10 columns
    const rows = imgRow; // First 28 rows
    const smoothingFactor = 0.2; // Determines the blend ratio; adjust as needed

    for (let row = 0; row < rows; row++) {
        let rowBrightness = [];
        for (let col = 0; col < cols; col++) {
            const index = (row * imageWidth + col) * 4; // Adjust index for RGBA
            const red = data[index];
            const green = data[index + 1];
            const blue = data[index + 2];
            // Calculate current brightness
            const currentBrightness = 0.299 * red + 0.587 * green + 0.114 * blue;
            
            // Retrieve previous brightness and calculate smoothed value
            const prevBrightness = prevBrightnessValues[row][col];
            const smoothedBrightness = prevBrightness + smoothingFactor * (currentBrightness - prevBrightness);

            // Update the row's brightness array and the previous values storage
            rowBrightness.push(smoothedBrightness);
            prevBrightnessValues[row][col] = smoothedBrightness;
        }
        brightnessValues.push(rowBrightness);
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
