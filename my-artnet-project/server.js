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

let once = false;
app.post('/test-dmx', async (req, res) => {
    if (once) {

        // return res.status(400).json({ error: 'Sequence already triggered' });
    } else {
        once = true;
        try {
            const { dmxValues } = req.body; // Received all 30 columns brightness values

            console.log(dmxValues)
            // Function to delay execution
            const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

            // Get all the keys from csvMapping and sort them if necessary
            const keys = Object.keys(csvMapping).map(key => parseInt(key)).sort((a, b) => a - b).reverse();

            // Sequentially set each channel based on csvMapping
            for (const key of keys) {
                const { dmxUniverse, dmxChannel } = csvMapping[key.toString()];
                let dmxValues = new Array(dmxChannel).fill(0); // Initialize with zeros up to the current channel
                dmxValues[dmxChannel - 1] = 255; // Set the specific channel to white

                // Assuming sendDMXSignal is a function that accepts universe and values
                await sendDMXSignal( dmxValues);

                await delay(500); // Delay for visual effect

                // Reset the specific channel to 0 for the next iteration
                dmxValues[dmxChannel - 1] = 0;
                sendDMXSignal(dmxValues); // Turn off the channel after the delay
            }

            res.json({ message: 'Sequentially triggered each channel successfully.' });
        } catch (err) {
            console.error(`Error triggering channels: ${err}`);
            res.status(500).json({ error: 'Error triggering channels' });
        }
        once = false; // Reset the flag if needed
    }
});

// Define the sendDMXSignal function or adjust according to your actual DMX library usage
function sendDMXSignal(dmxValues) {
    // Implementation depends on your DMX library
    artnet.set(1, dmxValues); // 0 is the universe number
}

app.post('/set-dmx', async (req, res) => {
    // if(once){
    //
    // }
    // else {
    //     once = true;
    //
    //     async function setEachChannelInUniverseToMax(universe = 0, totalChannels = 280) {
    //         for (let channel = 1; channel <= totalChannels; channel++) {
    //             // Initialize all channels to 0
    //             let values = new Array(totalChannels).fill(0);
    //
    //             // Set the current channel to 255
    //             values[channel - 1] = 255;
    //
    //             try {
    //                 // Send the DMX values to the specified universe
    //                 // Adjust the universe index as needed for your implementation
    //                 await artnet.set(universe, values);
    //                 console.log(`Set channel ${channel} to 255 in universe ${universe + 1}`);
    //             } catch (error) {
    //                 console.error(`Error setting DMX values for channel ${channel}: ${error}`);
    //                 // Optionally, break the loop or continue to the next iteration
    //             }
    //
    //             // Wait for 1 second before continuing to the next channel
    //             await new Promise(resolve => setTimeout(resolve, 500));
    //         }
    //     }
//
// Call the function to start the process
//         setEachChannelInUniverseToMax(0); // Universe is 0-indexed in this example
//     }
    try {
        const { dmxValues } = req.body; // Received all 30 columns brightness values
        let universeData = {};
        // console.log(dmxValues)
        const gridWidth = 10; // Number of columns to display
        const rows = dmxValues.length; // Total rows
        for (let row = 0; row < rows; row++) {
            const rowData = dmxValues[row].reverse(); // Get the brightness values for the current row
            for (let col = 0; col < 10; col++) {
                const colIndex = col; // Considering the gridWidth as totalColumns
                const brightness = rowData[col]; // Set first row to black, others follow rowData values
                const mapping = csvMapping[`${row}-${col}`]; // Assuming the mapping is based on row and colIndex
                if (mapping) {
                    const { dmxUniverse, dmxChannel } =
                        mapping;
                    if (!universeData[dmxUniverse]) {
                        universeData[dmxUniverse] = [];
                    }
                    universeData[dmxUniverse].push({ channel: dmxChannel, value: brightness });
                }
            }
        }

        // Send DMX values for each universe
        for (const [universe, channels] of Object.entries(universeData)) {
            const sortedChannels = channels.sort((a, b) => a.channel - b.channel);
            let values = new Array(sortedChannels[sortedChannels.length - 1].channel).fill(0);
            sortedChannels.forEach(({ channel, value }) => {
                values[channel] = value;
            });
            artnet.set(parseInt(universe)-1, values);
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
