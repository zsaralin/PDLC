const fs = require('fs');
const {parse}  = require('csv-parse');

// Function to parse the CSV and create a mapping object
const filePath = './layout.csv';

function createCsvMapping() {
    return new Promise((resolve, reject) => {
        const parser = parse({ columns: true, trim: true }, (err, records) => {
            if (err) {
                reject(err);
                return;
            }
            const mapping = {};
            records.forEach(record => {
                const row = parseInt(record['row'], 10); // Assuming 'row' field represents row index
                const col = parseInt(record['col'], 10); // Assuming 'col' field represents column index
                const key = `${row}-${col}`; // Generating key based on row and column indices
                mapping[key] = {
                    dmxUniverse: parseInt(record['dmx universe'], 10),
                    dmxChannel: parseInt(record['dmx channel'], 10)
                };
            });
            resolve(mapping);
        });

        fs.createReadStream(filePath).pipe(parser);
    });
}
module.exports = { createCsvMapping }; // Exporting createCsvMapping function
