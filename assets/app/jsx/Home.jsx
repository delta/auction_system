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

    componentDidMount() {
        this.getLiveAuctions();
    }

    getLiveAuctions() {
        let user = JSON.parse(sessionStorage.getItem('user'));
        if (user == null || user.role != 'User') {
            window.location.href = '/login';
        } else {
            dataFetch('/liveAuctions', {isAuthRequired: true})
                .then(response => {
                    if (response.status_code == 200 && response.message != null && response.message != []) {
                        this.setState({
                            liveAuctions: response.message
                        });
                    } else {
                        notifyError(response.message);
                    }
                })
                .catch(err => {
                    notifyError('' + err.response);
                });
        }
    }
    joinAuction = auction => {
        this.props.history.push(`/auction/${auction.auction_url}/${auction.id}`);
    };

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
                                    <span style={{cursor: 'pointer'}} onClick={() => this.joinAuction(auction)}>
                                        {auction.auction_url}
                                    </span>
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
