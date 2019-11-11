let dataFetch = async (url, params) => {
    const apiConfig = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify(params)
    };

    return fetch('http://localhost:4000/api' + url, apiConfig)
        .then(function(response) {
            return response.json().then(json => {
                return json; //Gets cascaded to the next then block
            });
        })
        .catch(function(error) {
            throw error; //gets caught in the higher catch block
        });
};

export default dataFetch;
