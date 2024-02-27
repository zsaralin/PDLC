const express = require('express');
const cors = require('cors');
const {createCsvMapping} = require("./csvMapping");

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

let once = false;
app.post('/test-dmx', async (req, res) => {
    if (!once) {
        once = true;

        async function setChannelBasedOnMapping() {
            const rows = 28; // Assuming 29 rows based on your description
            const cols = 10; // Assuming 10 columns based on your description
            const totalChannels = 280; // Max channels per universe

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const key = `${row}-${col}`;
                    const mapping = csvMapping1[key];

                    if (mapping) {
                        const { dmxUniverse, dmxChannel } = mapping;
                        // Convert to 1-indexed universe for artnet.set
                        const universeIndex = dmxUniverse - 1;

                        // Clear all channels before setting the current one to max
                        let clearValues = new Array(totalChannels).fill(0);
                        await artnet.set(universeIndex, 1, clearValues);
                        try {
                            // After clearing, set the specific channel to max brightness
                            await artnet.set(universeIndex, dmxChannel, [255,255]);
                            // Wait 500ms before setting the next channel
                            await new Promise(resolve => setTimeout(resolve, 500));
                        } catch (error) {
                            console.error(`Error setting DMX for ${key}: ${error}`);
                            // Optionally, handle error (e.g., break, continue, or retry logic)
                        }
                    }
                }
            }
        }

        // Call the function to start the iterative setting process
        setChannelBasedOnMapping().then(() => {
            res.json({ message: 'DMX settings updated iteratively with clearing.' });
        }).catch(err => {
            console.error(`Error in iterative setting process: ${err}`);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Error during iterative DMX setting with clearing' });
            }
        });
    } else {
        res.status(400).json({ message: 'Operation already in progress.' });
    }
});

// Define the sendDMXSignal function or adjust according to your actual DMX library usage
function sendDMXSignal(dmxValues) {
    // Implementation depends on your DMX library
    artnet.set(1, dmxValues); // 0 is the universe number
}

app.post('/set-dmx', async (req, res) => {
        try {
            if(once){
                let clearValues = new Array(512).fill(0);
                await artnet.set(0, 1, clearValues);
                await artnet.set(1, 1, clearValues);

            }
            else {
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
                        if (channel <= 300) { // Considering only channels up to 300
                            values[channel - 1] = value; // Subtracting 1 to adjust for zero-based indexing
                        }
                    });

                    // Instead of awaiting here, push the promise into an array
                    setPromises.push(artnet.set(parseInt(universe), 1, values));
                }

                // Wait for all set operations to complete
                await Promise.all(setPromises);
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
