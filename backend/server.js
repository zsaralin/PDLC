const express = require('express');
const cors = require('cors');
const {createCsvMapping} = require("./csvMapping");
const {getAllControlValues, setCameraControl} = require('./uvcControl')
const app = express();
app.use(cors()); // Use CORS if needed
app.use(express.json()); // Middleware to parse JSON bodies

// Route to handle POST request
let imgCol; let imgRow;
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

createCsvMapping()
    .then(c => {
        // Use the mapping here
        csvMapping0 = c[0];
        csvMapping1 = c[1]
    })
    .catch(error => {
        console.error('Failed to create CSV mapping:', error);
    });


app.post('/set-dmx', async (req, res) => {
        try {
                // once = true;
                let {dmxValues} = req.body; // Received all 30 columns brightness values
                dmxValues = dmxValues.map(row => row.map(value => 255 - value));
                // console.log(dmxValues)
                let universeData = {};
                // console.log(dmxValues)
                const gridWidth = 10; // Number of columns to display
                const rows = dmxValues.length; // Total rows
                for (let row = 0; row < rows; row++) {
                    const rowData = dmxValues[row].reverse(); // Get the brightness values for the current row
                    for (let col = 0; col < 10; col++) {
                        let colIndex = col //- (imgCol - 30); // Considering the gridWidth as totalColumns
                        const brightness = rowData[colIndex]; // Set first row to black, others follow rowData values
                        const mapping = csvMapping0[`${row}-${col}`]; // Assuming the mapping is based on row and colIndex
                        if (mapping) {
                            const {dmxUniverse, dmxChannel} =
                                mapping;
                            if (!universeData[1]) {
                                universeData[1] = [];
                            }
                            universeData[1].push({channel: dmxChannel, value: brightness});
                        }
                    }
                }
                for (let row = 0; row < rows; row++) {
                    const rowData = dmxValues[row]; // Get the brightness values for the current row
                    for (let col = 10; col < 20; col++) {
                        const colIndex = col + (imgCol - 30)/2; // Considering the gridWidth as totalColumns
                        const brightness = rowData[colIndex]; // Set first row to black, others follow rowData values
                        const mapping = csvMapping1[`${row}-${col - 10}`]; // Assuming the mapping is based on row and colIndex
                        if (mapping) {
                            const {dmxUniverse, dmxChannel} =
                                mapping;
                            if (!universeData[0]) {
                                universeData[0] = [];
                            }
                            universeData[0].push({channel: dmxChannel, value: brightness});
                        }
                    }
                }
                // Send DMX values for each universe
                const setPromises = [];
                for (const [universe, channels] of Object.entries(universeData)) {
                    let values = new Array(512).fill(0); // Initialize with zeros for all channels
                    channels.forEach(({channel, value}) => {
                        // console.log('uni ' + universe + ' and ' + channel)
                        if (channel <= 300) { // Considering only channels up to 280
                            values[channel - 1] = value; // Subtracting 1 to adjust for zero-based indexing
                        }
                    });
                    await artnet.set(parseInt(universe), 1, values);
                }
        
            res.json({message: 'DMX set successfully'});
        } catch (err) {
            console.error(`Error setting DMX values: ${err}`);
            if (!res.headersSent) {
                res.status(500).json({error: 'Error setting DMX'});
            }
        }

});

// Start the server
const PORT = 3000; // Port number for the HTTP server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.get('/get-control-values', async (req, res) => {
    try {
        const controlValues = await getAllControlValues();
        res.json({ controlValues });
    } catch (error) {
        console.error('Error fetching control values:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch control values' });
    }
});

app.post('/set-camera-control', (req, res) => {
    const { controlName, value } = req.body;
    if (!controlName || value === undefined) {
        return res.status(400).send('Missing control name or value');
    }

    setCameraControl(controlName, value, (err) => {
        if (err) {
            console.error(`Error setting ${controlName}:`, err);
            return res.status(500).send(`Error setting ${controlName}`);
        } else {
            return res.send(`${controlName} set to ${value}`);
        }
    });
});