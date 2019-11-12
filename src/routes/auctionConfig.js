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

app.post('/auctionConfig', function(req, res) {
    if (req.body.q_type == 'get_config') {
        models.AuctionConfig.findOne({
            where: {
                owner_id: req.body.user_id
            },
            raw: true,
            logging: false
        })
            .then(owner => {
                Sendresponse(res, 200, owner);
            })
            .catch(err => {
                Sendresponse(res, 400, 'Not in table :D');
            });
    } else if (req.body.q_type == 'add_config') {
        models.AuctionConfig.build({
            owner_id: req.body.user_id,
            can_register: req.body.can_register,
            is_open: req.body.is_open,
            auction_url: req.body.url_slug,
            max_users: req.body.max_users
        })
            .save()
            .then(response => {
                Sendresponse(res, 200, 'Config Added Successfully');
            })
            .catch(err => {
                Sendresponse(res, 400, 'Error Adding Auction Config');
            });
    } else if (req.body.q_type == 'update_config') {
        models.AuctionConfig.update(
            {
                owner_id: req.body.owner_id,
                can_register: req.body.can_register,
                is_open: req.body.is_open,
                auction_url: req.body.url_slug,
                max_users: req.body.max_users
            },
            {
                where: {
                    owner_id: req.body.owner_id
                },
                raw: true,
                logging: false
            }
        ).then(response => {
            Sendresponse(res, 200, 'Config Updated Successfully');
        });
    } else {
        Sendresponse(res, 400, 'Invalid Config Details');
    }
});

module.exports = app;
