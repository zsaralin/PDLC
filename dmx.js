// const interval = 100; // Interval in milliseconds (1 second)
// // Create an array to hold the DMX values for all channels
// const dmxValues = Array(512).fill(0); // Initialize all channels to 0
// const fadeDuration = 50; // Duration for each fade (0 to 255 and 255 to 0) in milliseconds
// src/index.js
// var artnet = require('artnet');


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

export function setDMXFromPixelCanvas(pixelCanvas) {
    const gridWidth = 10; // Focus on the first 10 columns
    const gridHeight = 28; // Total height of the grid
    const ctx = pixelCanvas.getContext('2d');

    const totalWidth = pixelCanvas.width;
    const totalHeight = pixelCanvas.height;

    const cellWidth = totalWidth / 30; // Original grid width is 30 cells
    const cellHeight = totalHeight / gridHeight;

    // Array to store the brightness of each cell in the first 10 columns
    let brightnessValues = [];

    // Loop through the grid cells in the first 10 columns
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            // Calculate the coordinates of the current cell
            const cellX = x * cellWidth;
            const cellY = y * cellHeight;

            // Extract the pixel data from the pixelated canvas for the current cell
            const cellImageData = ctx.getImageData(cellX, cellY, 1, 1); // Get just one pixel
            const cellData = cellImageData.data;

            // Directly use the Red component for brightness as R=G=B in grayscale
            const brightness = cellData[0]; // No need to calculate total or average

            // Store the brightness of the cell
            brightnessValues.push(brightness);
        }
    }
    // Make sure to replace 'count' with your actual condition or mechanism to control the fetch call frequency
    if (count === 100) { // Adjust according to your actual condition
        count = 0;
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
    } else {
        count++; // Make sure 'count' is defined and incremented properly
    }
}

// let currentChannel = 0;

// Start sending
// DMX frames repeatedly
// setInterval(fadeInOut, interval);