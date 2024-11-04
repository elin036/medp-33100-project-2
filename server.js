const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/data', (req, res) => {
    const csvFilePath = path.join(__dirname, 'World Happiness Index by Reports 2013-2023 with nulls.csv');

    const results = [];
    fs.createReadStream(csvFilePath)
        .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
        .on('data', (data) => {
            console.log('Parsed row:', data);
            results.push(data);
        })
        .on('end', () => {
            res.json(results); 
        })
        .on('error', (error) => {
            console.error('Error reading CSV:', error);
            res.status(500).send('Error reading CSV file');
        });
});

app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
