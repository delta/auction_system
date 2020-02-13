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
                catalogs = JSON.parse(JSON.stringify(catalogs));
                let finalCatalogues = catalogs.map(c => {
                    if (itemIds.includes(c.id)) {
                        c.sold = true;
                    } else c.sold = false;
                    return c;
                });
                let itemAvailable = catalogs.filter(x => !itemIds.includes(x.id));
                Sendresponse(res, 200, finalCatalogues);
            });
        })
        .catch(err => {
            Sendresponse(res, 400, 'Not found Data');
        });
});
app.post('/createCatalog', function(req, res) {
    const {owner_id, name, quantity, base_price, for_sale, description, thumbnail_url} = req.body;
    models.Catalog.build({
        owner_id,
        name,
        quantity,
        base_price,
        for_sale,
        description,
        thumbnail_url
    })
        .save()
        .then(response => {
            Sendresponse(res, 200, 'Created Successfully');
        })
        .catch(err => {
            Sendresponse(res, 400, 'Error in creating');
        });
});

app.post('/deleteCatalog', function(req, res) {
    const {id} = req.body;
    models.Catalog.destroy({
        where: {
            id
        }
    })
        .then(response => {
            Sendresponse(res, 200, 'Deleted Successfully');
        })
        .catch(err => {
            Sendresponse(res, 400, 'Error in deleting');
        });
});

app.post('/updateCatalog', function(req, res) {
    const {id, owner_id, name, quantity, base_price, for_sale, description, thumbnail_url} = req.body;
    models.Catalog.update(
        {
            owner_id,
            name,
            quantity,
            base_price,
            for_sale,
            description,
            thumbnail_url
        },
        {
            where: {
                id
            }
        }
    )
        .then(response => {
            Sendresponse(res, 200, 'Updated Successfully');
        })
        .catch(err => {
            Sendresponse(res, 400, 'Error in Updating');
        });
});

module.exports = app;
