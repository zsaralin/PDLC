const express = require('express');
const cors = require('cors');
const {createCsvMapping} = require("./csvMapping");

const app = express();
app.use(cors()); // Use CORS if needed
app.use(express.json()); // Middleware to parse JSON bodies

// Configure your Art-Net options
const options = {
    host: '10.0.7.190',
    port: 0, // Art-Net port, typically 6454
};
const artnet = require('artnet')(options);
let csvMapping;
createCsvMapping()
    .then(c => {
        // Use the mapping here
        csvMapping = c;
    })
    .catch(error => {
        console.error('Failed to create CSV mapping:', error);
    });
app.post('/set-dmx', async (req, res) => {
    try {
        const { dmxValues } = req.body;

        // Object to hold channel values keyed by universe
        let universeData = {};

        // Populate universeData with channel values
        dmxValues.forEach((brightness, index) => {
            const mapping = csvMapping[index.toString()]; // Assuming index correlates directly with csvMapping keys

            if (mapping) {
                const { dmxUniverse, dmxChannel } = mapping;
                if (!universeData[dmxUniverse]) {
                    universeData[dmxUniverse] = [];
                }
                universeData[dmxUniverse].push({ channel: dmxChannel, value: brightness });
            }
        });

        // Now, for each universe, sort the channel data and send it using artnet.set
        for (const [universe, channels] of Object.entries(universeData)) {
            // Sort channels by channel number before sending
            const sortedChannels = channels.sort((a, b) => a.channel - b.channel);

            // Prepare a flat array of values for artnet.set
            // This assumes the DMX channels are continuous and start from 1
            let values = new Array(sortedChannels[sortedChannels.length - 1].channel).fill(0); // Initialize with 0
            sortedChannels.forEach(({ channel, value }) => {
                values[channel - 1] = value; // Channel numbers are 1-indexed in DMX
            });

            // Send the DMX values for the current universe
            // Adjust the usage of artnet.set according to your library's API
            await artnet.set(parseInt(universe) - 1, values);
        }

        res.json({ message: 'DMX set successfully' });
    } catch (err) {
        console.error(`Error setting DMX values: ${err}`);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error setting DMX' });
        }
    }
});

// Start the server
const PORT = 3000; // Port number for the HTTP server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
