const DMX = require('dmx');

// Initialize the DMX universe
const dmx = new DMX();

export function pixelCanvasToDMX(pixelatedCanvas) {
    const pixelatedCtx = pixelatedCanvas.getContext('2d', { willReadFrequently: true });

    const gridWidth = 28;
    const gridHeight = 30;
    const cellWidth = pixelatedCanvas.width / gridWidth;
    const cellHeight = pixelatedCanvas.height / gridHeight;

    // Loop through the grid cells
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            // Calculate the coordinates and dimensions of the current cell
            const cellX = x * cellWidth;
            const cellY = y * cellHeight;
            const cellWidthPx = cellWidth;
            const cellHeightPx = cellHeight;

            // Extract the pixel data from the pixelated canvas for the current cell
            const cellImageData = pixelatedCtx.getImageData(cellX, cellY, cellWidthPx, cellHeightPx);
            const cellColor = {
                r: cellImageData.data[0],
                g: cellImageData.data[1],
                b: cellImageData.data[2]
            };

            // Calculate DMX values based on the RGB color
            const dmxRed = Math.floor((cellColor.r / 255) * 255);
            const dmxGreen = Math.floor((cellColor.g / 255) * 255);
            const dmxBlue = Math.floor((cellColor.b / 255) * 255);

            // Send the DMX values to the DMX controller for the fixture
            const dmxChannel = 1; // Replace with the actual DMX channel for the fixture
            dmxController.setChannelValue(dmxChannel, dmxRed);
            dmxController.setChannelValue(dmxChannel + 1, dmxGreen);
            dmxController.setChannelValue(dmxChannel + 2, dmxBlue);

            // You may need to implement DMX-specific logic for your DMX controller.
        }
    }
}