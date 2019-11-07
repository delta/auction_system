const sendresponse = (res, status_code, message) => {
    let response = new Object();
    response.status_code = status_code;
    response.message = message;
    res.json(response);
};

module.exports = sendresponse;
