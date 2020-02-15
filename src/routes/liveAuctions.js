const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const Sendresponse = require('../sendresponse');
const models = require(__dirname + '/../../models/');
const authCheck = require(__dirname + './../middleware/authCheck');
const adminAuthCheck = require(__dirname + './../middleware/adminAuthCheck');

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

app.use('/liveAuctions', authCheck);

app.post('/liveAuctions', function(req, res) {
    models.AuctionConfig.findAll({
        where: {
            is_open: true,
            can_register: true
        }
    })
        .then(responses => {
            Sendresponse(res, 200, responses);
        })
        .catch(err => {
            Sendresponse(res, 400, err.message);
        });
});

module.exports = app;
