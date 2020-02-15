const Sendresponse = require('../sendresponse');
const Sequelize = require('sequelize');
const models = require(__dirname + '/../../models/');

const authCheck = (req, res, next) => {
    if (req.body.user_token) {
        let user_id = req.body.userIdForAuth;
        let user_token = req.body.user_token;
        models.User.findOne({where: {id: user_id, token: user_token, role: 'Admin'}})
            .then(function(admin) {
                if (admin) {
                    next();
                } else {
                    Sendresponse(res, 401, 'Unauthorized access');
                }
            })
            .catch(function(err) {
                status_code = 500;
                message = err.message;
                Sendresponse(res, status_code, message);
            });
    } else {
        Sendresponse(res, 401, 'Unauthorized access');
    }
};

module.exports = authCheck;
