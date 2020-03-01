const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const Sendresponse = require('../sendresponse');
const models = require(__dirname + '/../../models/');
const md5 = require('md5');
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

app.use('/addAuctionConfig', adminAuthCheck);
app.use('/updateAuctionConfig', adminAuthCheck);
app.use('/authorizeAuction', authCheck);
app.use('/getAuctionConfig', adminAuthCheck);
app.use('/getRegisteredUser', adminAuthCheck);
app.use('/accessAuction', authCheck);
app.use('/userAuctionRegistration', authCheck);

app.post('/getAuctionConfig', function(req, res) {
    const {user_id} = req.body;
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
});

app.post('/addAuctionConfig', function(req, res) {
    const {user_id, can_register, is_open, url_slug: auction_url, max_users, access_type, password} = req.body;
    models.AuctionConfig.build({
        owner_id: user_id,
        can_register,
        is_open,
        auction_url,
        max_users,
        access_type,
        password: md5(password)
    })
        .save()
        .then(response => {
            Sendresponse(res, 200, response);
        })
        .catch(err => {
            Sendresponse(res, 400, 'Error Adding Auction Config');
        });
});
app.post('/updateAuctionConfig', function(req, res) {
    const {can_register, is_open, url_slug: auction_url, max_users, owner_id} = req.body;
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
    )
        .then(response => {
            Sendresponse(res, 200, 'Config Updated Successfully');
        })
        .catch(err => {
            Sendresponse(res, 400, err.message);
        });
});

app.post('/authorizeAuction', (req, res) => {
    const {auction_url, password} = req.body;
    models.AuctionConfig.findOne({
        where: {
            auction_url
        },
        raw: true,
        logging: false
    })
        .then(auction => {
            if (md5(password) === auction.password) {
                Sendresponse(res, 200, {verified: true});
            } else {
                Sendresponse(res, 200, {verified: false});
            }
        })
        .catch(err => {
            Sendresponse(res, 400, 'Not in table :D');
        });
});

app.post('/accessAuction', (req, res) => {
    models.AuctionConfig.findOne({
        where: {
            auction_url: req.body.url_slug
        },
        attributes: ['access_type'],
        raw: true,
        logging: false
    })
        .then(auction => {
            Sendresponse(res, 200, auction);
        })
        .catch(err => {
            Sendresponse(res, 400, 'Not in table :D');
        });
});

app.post('/userAuctionRegistration', (req, res) => {
    const {user_id, auction_id} = req.body;
    models.Registration.findOne({
        where: {
            user_id,
            auction_id
        }
    })
        .then(users => {
            if (!users) {
                models.Registration.build({
                    user_id,
                    auction_id
                })
                    .save()
                    .then(registration => {
                        Sendresponse(res, 200, registration);
                    });
            } else {
                Sendresponse(res, 200, users);
            }
        })
        .catch(err => {
            Sendresponse(res, 400, 'Error Registering User');
        });
});

app.post('/getRegisteredUser', (req, res) => {
    const {auction_id} = req.body;
    models.Registration.findAll({
        where: {
            auction_id
        },
        raw: true
    })
        .then(users => {
            Sendresponse(res, 200, users);
        })
        .catch(err => {
            Sendresponse(res, 400, 'Error fetching User - ' + err.message);
        });
});

module.exports = app;
