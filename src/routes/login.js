const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const Sendresponse = require('../sendresponse');
const models = require(__dirname + '/../../models/');
const md5 = require('md5');

// trust first proxy
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

app.post('/login', function(req, res) {
    const {username, password} = req.body;
    models.User.findOne({
        where: {
            name: username
        },
        raw: true,
        logging: false
    })
        .then(user => {
            let message = {};
            message.role = user.role;
            message.user_id = user.id;
            let userToken = md5(username + Date.now());

            if (md5(password) == user.password) {
                models.User.update(
                    {token: userToken},
                    {
                        where: {
                            name: username
                        },
                        raw: true,
                        logging: false
                    }
                ).then(response => {
                    message['username'] = username;
                    message['token'] = userToken;
                    Sendresponse(res, 200, message);
                });
            } else {
                Sendresponse(res, 400, 'Invalid Credentials');
            }
        })
        .catch(err => {
            Sendresponse(res, 400, 'Not in table :D');
        });
});

module.exports = app;
