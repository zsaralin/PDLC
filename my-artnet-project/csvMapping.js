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
                const key = record.ID;
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
