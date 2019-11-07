const express = require('express');
const app = express();

const sample = require('./routes/sample');

app.use('/api', sample);

module.exports = app;
