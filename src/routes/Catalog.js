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

app.post('/getCatalog', function(req, res) {
    const {owner_id} = req.body;
    models.Catalog.findAll({
        where: {
            owner_id
        }
    })
        .then(catalogs => {
            let catalogItemIds = catalogs.map(catalog => catalog.id);
            models.AuctionSummary.findAll({
                where: {
                    item_id: catalogItemIds
                }
            }).then(items => {
                let itemIds = items.map(items => items.item_id);
                let itemAvailable = catalogs.filter(x => !itemIds.includes(x.id));
                Sendresponse(res, 200, itemAvailable);
            });
        })
        .catch(err => {
            Sendresponse(res, 400, 'Not found Data');
        });
});

module.exports = app;
