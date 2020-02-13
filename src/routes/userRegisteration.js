const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const Sendresponse = require('../sendresponse');
const models = require(__dirname + '/../../models/');
const md5 = require('md5');
const authCheck = require(__dirname + './../middleware/authCheck');
const adminAuthCheck = require(__dirname + './../middleware/adminAuthCheck');

//Sample file for all routes

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

router.use(bodyParser.json());

router.use('/getUserDetails', adminAuthCheck);

router.post('/userRegisteration', function(req, res) {
    const {username: name, password, email, contact, country} = req.body;
    models.User.build({
        name,
        password: md5(password),
        role: 'User',
        balance: 0,
        email,
        contact,
        country
    })
        .save()
        .then(response => {
            Sendresponse(res, 200, 'User Registered Successfully');
        })
        .catch(err => {
            Sendresponse(res, 400, 'Error registering user - ' + err.message);
        });
});

router.post('/getUserDetails', (req, res) => {
    models.User.findAll({
        where: {
            id: req.body.ids
        },
        attributes: ['name', 'email', 'contact', 'country', 'id']
    })
        .then(response => {
            Sendresponse(res, 200, response);
        })
        .catch(err => {
            Sendresponse(res, 400, ' Error in fetching user details');
        });
});

module.exports = router;
