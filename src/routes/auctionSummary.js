const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const Sendresponse = require('../sendresponse');
const models = require(__dirname + '/../../models/');

// trust first proxy3
app.set('trust proxy', 1);

app.use(
    cookieSession({
        name: 'session',
        keys: ['key1', 'key2']
    })
);

app.use(
    bodyParser.urlencoded({
        extended: false
    })
);

app.use(bodyParser.json());

app.post('/saveAuctionSummary', function(req, res) {
    console.log('auction summary body ', req.body);
    const {user_id, item_id, final_price} = req.body;
    models.AuctionSummary.build({
        user_id,
        item_id,
        final_price
    })
        .save()
        .then(response => {
            Sendresponse(res, 200, 'Saved Successfully');
        })
        .catch(err => {
            Sendresponse(res, 400, 'Error while saving');
        });
});

module.exports = app;
