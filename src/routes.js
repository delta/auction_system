const express = require('express');
const app = express();

const sample = require('./routes/sample');
const userRegisteration = require('./routes/userRegisteration');
const login = require('./routes/login');
const auctionConfig = require('./routes/auctionConfig');
const liveAuctions = require('./routes/liveAuctions');
const catalog = require('./routes/Catalog');
const saveAuctionSummary = require('./routes/auctionSummary');

app.use('/api', sample);
app.use('/api', userRegisteration);
app.use('/api', login);
app.use('/api', auctionConfig);
app.use('/api', liveAuctions);
app.use('/api', catalog);
app.use('/api', saveAuctionSummary);

module.exports = app;
