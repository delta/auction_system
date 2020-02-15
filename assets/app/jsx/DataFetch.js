let dataFetch = async (url, params) => {

    try {
        if (params.isAuthRequired) {
            let user = JSON.parse(sessionStorage.getItem('user'));
            const userIdForAuth = user.user_id;
            const user_token = user.token;
            params.userIdForAuth = Number(userIdForAuth);
            params.user_token = user_token;
        }
    } catch (error) {
        throw error;
    }


    const apiConfig = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify(params)
    };

    return fetch('http://localhost:4000/api' + url, apiConfig)
        .then(function(response) {
            return response.json().then(json => {
                if(json.status_code == 401) {
                    window.location.href = '/login';
                }
                return json; //Gets cascaded to the next then block
            });
        })
        .catch(function(error) {
            throw error; //gets caught in the higher catch block
        });
};

export default dataFetch;
