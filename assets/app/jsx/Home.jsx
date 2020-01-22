import React, {Component} from 'react';
import dataFetch from './DataFetch';
import {notifyError} from '../Common/common';

const style = {
    container: {
        textAlign: 'center'
    },
    title: {
        fontWeight: 'lighter',
        fontSize: '30px'
    }
};

let socket;

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            liveAuctions: []
        };
    }

    componentWillMount() {
        this.getLiveAuctions();
    }

    getLiveAuctions() {
        let user = JSON.parse(sessionStorage.getItem('user'));
        if (user == null || user.role != 'User') {
            window.location.href = '/login';
        } else {
            dataFetch('/liveAuctions', {})
                .then(response => {
                    if (response.status_code == 200 && response.message != null && response.message != []) {
                        this.setState({
                            liveAuctions: response.message
                        });
                    }
                })
                .catch(err => {
                    notifyError(err.response);
                });
        }
    }

    render() {
        return (
            <div>
                <div style={style.container}>
                    <div style={style.title}>Welcome to Auctoins:</div>
                    <p>List of live auctions:</p>
                    {this.state.liveAuctions.length == 0 ? (
                        <p>No live auctions found...</p>
                    ) : (
                        this.state.liveAuctions.map(auction => {
                            return (
                                <div>
                                    <a href={'http://localhost:4000/auction/' + auction.auction_url}>
                                        {auction.auction_url}
                                    </a>
                                    <br />
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        );
    }
}

export default Home;
