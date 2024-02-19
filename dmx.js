// const interval = 100; // Interval in milliseconds (1 second)
// // Create an array to hold the DMX values for all channels
// const dmxValues = Array(512).fill(0); // Initialize all channels to 0
// const fadeDuration = 50; // Duration for each fade (0 to 255 and 255 to 0) in milliseconds
// src/index.js
// var artnet = require('artnet');


import {updateDMXGrid} from "./dmxGrid.js";

var options = {
    host: '10.0.7.190',
    port: '1' // Default Art-Net port
};

// var dmx = artnet(options);

// Example usage (adjust according to your needs)
// dmx.set(1, [255, 255, 255], function(err, res) {
//     if (err) console.log(err);
//     else console.log('DMX data sent:', res);
// });
//
// // Don't forget to close the connection when done
// dmx.close();
let count = 0;

export async function setDMXFromPixelCanvas(imageData) {

    let brightnessValues = [];
    const data = imageData.data;
    const imageWidth = imageData.width; // Actual width of the imageData
    const cols = 30; // First 10 columns
    const rows = 28; // First 28 rows

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
        fetch('http://localhost:3000/set-dmx', {
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

// let currentChannel = 0;

// Start sending
// DMX frames repeatedly
// setInterval(fadeInOut, interval);