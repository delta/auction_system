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

app.use('/saveAuctionSummary', adminAuthCheck);

app.post('/saveAuctionSummary', function(req, res) {
    const {user_id, item_id, final_price} = req.body;

    Sequelize.sequelize
        .transaction(function(t) {
            return models.AuctionSummary.create(
                {
                    user_id,
                    item_id,
                    final_price
                },
                {transaction: t}
            ).then(response => {
                return models.User.increment(
                    {balance: -final_price},
                    {
                        where: {
                            id: user_id
                        },
                        transaction: t
                    }
                );
            });
        })
        .then(user => {
            Sendresponse(res, 200, 'Saved Successfully');
        })
        .catch(err => {
            Sendresponse(res, 400, 'Error in Saving - ' + err.message);
        });
});

module.exports = app;
