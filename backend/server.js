const express = require('express');
const cors = require('cors');
const { createCsvMapping } = require("./csvMapping");
const { getAllControlValues, setCameraControl } = require('./uvcControl');
const app = express();
app.use(cors()); // Use CORS if needed
app.use(express.json()); // Middleware to parse JSON bodies

// Route to handle POST request
let imgCol, imgRow;
app.post('/set-position', (req, res) => {
    ({ imgCol, imgRow } = req.body);
    // Respond to the client
    res.json({ message: 'Received imgCol and imgRow', imgCol, imgRow });
});

// Configure your Art-Net options
const options = {
    host: '10.0.7.190',
    // port: 0, // Art-Net port, typically 6454
};
const artnet = require('artnet')(options);
let csvMapping0;
let csvMapping1;
let csvMapping2;

createCsvMapping()
    .then(c => {
        // Use the mapping here
        csvMapping0 = c[0];
        csvMapping1 = c[1];
        csvMapping2 = c[2];
        // console.log(csvMapping2)
    })
    .catch(error => {
        console.error('Failed to create CSV mapping:', error);
    });

let once = false;

let previousValues = {};

function smoothTransition(prevValue, newValue, factor = 0.3) {
    return prevValue + (newValue - prevValue) * factor;
}

app.post('/set-dmx', async (req, res) => {
    if (false) { }
    else {
        once = true;
        try {
            let { dmxValues } = req.body; // Received all 30 columns brightness values
            dmxValues = dmxValues.map(row => row.map(value => 255 - value));
            let universeData = {};
            const gridWidth = 10; // Number of columns to display
            const rows = dmxValues.length; // Total rows

            function applyDimmerSpeed(mapping, brightness) {
                const adjustedBrightness = Math.round(brightness * mapping.dimmerSpeed);
                return Math.max(Math.min(adjustedBrightness, 255), 0); // Ensure the brightness does not exceed 255
            }

            for (let row = 0; row < rows; row++) {
                const rowData = dmxValues[row];
                for (let col = 0; col < 10; col++) {
                    let colIndex = col;
                    const brightness = rowData[colIndex];
                    const mapping = csvMapping0[`${row}-${9 - col}`];
                    if (mapping) {
                        const { dmxUniverse, dmxChannel, dimmerSpeed } = mapping;
                        const adjustedBrightness = applyDimmerSpeed(mapping, brightness);
                        if (!universeData[0]) {
                            universeData[0] = [];
                        }

                        const previousValue = previousValues[`${0}-${dmxChannel}`] || 255;
                        const smoothedBrightness = smoothTransition(previousValue, adjustedBrightness);

                        universeData[0].push({ channel: dmxChannel, value: smoothedBrightness });
                        previousValues[`${0}-${dmxChannel}`] = smoothedBrightness;
                    }
                }
            }

            for (let row = 0; row < rows; row++) {
                const rowData = dmxValues[row].reverse();
                for (let col = 10; col < 20; col++) {
                    const colIndex = col + (imgCol - 30) / 2;
                    const brightness = rowData[colIndex];
                    const mapping = csvMapping1[`${row}-${col - 10}`];
                    if (mapping) {
                        const { dmxUniverse, dmxChannel, dimmerSpeed } = mapping;
                        const adjustedBrightness = applyDimmerSpeed(mapping, brightness);
                        if (!universeData[1]) {
                            universeData[1] = [];
                        }

                        const previousValue = previousValues[`${1}-${dmxChannel}`] || 255;
                        const smoothedBrightness = smoothTransition(previousValue, adjustedBrightness);

                        universeData[1].push({ channel: dmxChannel, value: smoothedBrightness });
                        previousValues[`${1}-${dmxChannel}`] = smoothedBrightness;
                    }
                }
            }

            for (let row = 0; row < rows; row++) {
                const rowData = dmxValues[row].reverse();
                for (let col = 20; col < 30; col++) {
                    const colIndex = col + (imgCol - 30);
                    const brightness = rowData[colIndex];
                    const mapping = csvMapping2[`${row}-${9 - (col - 20)}`];
                    if (mapping) {
                        const { dmxUniverse, dmxChannel, dimmerSpeed } = mapping;
                        const adjustedBrightness = applyDimmerSpeed(mapping, brightness);
                        if (!universeData[2]) {
                            universeData[2] = [];
                        }

                        const previousValue = previousValues[`${2}-${dmxChannel}`] || 255;
                        const smoothedBrightness = smoothTransition(previousValue, adjustedBrightness);

                        universeData[2].push({ channel: dmxChannel, value: smoothedBrightness });
                        previousValues[`${2}-${dmxChannel}`] = smoothedBrightness;
                    }
                }
            }

            // Send DMX values for each universe
            for (const [universe, channels] of Object.entries(universeData)) {
                let values = new Array(512).fill(255); // Initialize with zeros for all channels
                channels.forEach(({ channel, value }) => {
                    if (channel <= 301) {
                        values[channel - 1] = value; // Subtracting 1 to adjust for zero-based indexing
                    }
                });
                await artnet.set(parseInt(universe), 1, values);
            }

            res.json({ message: 'DMX set successfully' });
        } catch (err) {
            console.error(`Error setting DMX values: ${err}`);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Error setting DMX' });
            }
        }
    }

})

// Start the server
const PORT = 3000; // Port number for the HTTP server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.post('/get-control-values', async (req, res) => {
    try {
        const { camIndex } = req.body;
        const controlValues = await getAllControlValues(camIndex);
        res.json({ controlValues });
    } catch (error) {
        console.error('Error fetching control values:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch control values' });
    }
});

app.post('/set-camera-control', (req, res) => {
    const { controlName, value, camIndex } = req.body;
    if (!controlName || value === undefined) {
        return res.status(400).send('Missing control name or value');
    }

    // setCameraControl(controlName, value, camIndex, (err) => {
    //     if (err) {
    //         console.error(`Error setting ${controlName}:`, err);
    //         return res.status(500).send(`Error setting ${controlName}`);
    //     } else {
    //         return res.send(`${controlName} set to ${value}`);
    //     }
    // });
});
