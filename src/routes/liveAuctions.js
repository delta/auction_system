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

app.post('/liveAuctions', function(req, res) {
    models.AuctionConfig.findAll({
        where: {
            is_open: true
        }
    })
        .then(responses => {
            console.log(responses);
            Sendresponse(res, 200, responses);
        })
        .catch(err => {
            Sendresponse(res, 400, 'Not in table :D');
        });
});

module.exports = app;
