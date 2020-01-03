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
    const {q_type, user_id, can_register, is_open, url_slug: auction_url, max_users, owner_id} = req.body;
    if (q_type == 'get_config') {
        models.AuctionConfig.findOne({
            where: {
                owner_id: user_id
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
    } else if (q_type == 'add_config') {
        models.AuctionConfig.build({
            owner_id: user_id,
            can_register,
            is_open,
            auction_url,
            max_users
        })
            .save()
            .then(response => {
                Sendresponse(res, 200, 'Config Added Successfully');
            })
            .catch(err => {
                Sendresponse(res, 400, 'Error Adding Auction Config');
            });
    } else if (q_type == 'update_config') {
        models.AuctionConfig.update(
            {
                owner_id,
                can_register,
                is_open,
                auction_url,
                max_users
            },
            {
                where: {
                    owner_id
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
