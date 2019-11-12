import React, {Component} from 'react';
import dataFetch from './DataFetch';
import io from 'socket.io-client';

const style = {
    formBox: {
        width: '300px',
        height: '600px',
        position: 'absolute',
        left: '50%',
        top: '50%',
        margin: '-300px 0 0 -150px',
        textAlign: 'center'
    }
};

let socket;

class Auction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user_id: '',
            userName: '',
            namespace: '',
            bid_value: 0,
            currentBidHolder: '',
            bidHolderName: '',
            is_open: false
        };
        this.handleBid = this.handleBid.bind(this);
    }

    componentWillMount() {
        this.checkStatus();
    }

    componentDidMount() {
        socket.on('connect', () => {
            //once connected to server, join particular room
            socket.emit('joinRoom', this.state.namespace, this.state.user_id);
        });
        socket.on('currentBidStatus', message => {
            this.setState({
                is_open: true,
                bid_value: message.currentBid,
                currentBidHolder: message.bidHolderId,
                bidHolderName: message.bidHolderName
            });
        });
        socket.on('auctionClosed', message => {
            this.setState({
                is_open: false
            });
            socket.close();
        });
    }

    socketConnect() {
        socket = io.connect();
    }

    checkStatus() {
        let {url_slug} = this.props.match.params;
        let user = JSON.parse(sessionStorage.getItem('user'));
        if (user == null || user.role != 'User') {
            window.location.href = '/login';
        } else {
            this.setState({
                user_id: user.user_id,
                userName: user.username,
                namespace: url_slug
            });
            this.socketConnect(); //initalize a socket connection between client & server
        }
    }

    handleBid() {
        socket.emit('newBid', this.state.namespace, this.state.user_id, this.state.userName, this.state.bid_value + 1);
    }

    render() {
        let isCurrentBidByU = false;
        if (this.state.user_id == this.state.currentBidHolder) {
            isCurrentBidByU = true;
        }
        return (
            <div style={style.formBox}>
                <h2>Auction: {this.state.namespace}</h2>
                <div className="container">
                    {this.state.is_open == false ? (
                        <p>Auction is either closed or not open yet!</p>
                    ) : (
                        <>
                            <h3>CurrentBid: {this.state.bid_value}</h3>
                            <h4>By: {isCurrentBidByU == true ? 'YOU' : this.state.bidHolderName}</h4>
                            <button className="btn btn-primary" disabled={isCurrentBidByU} onClick={this.handleBid}>
                                Bid Higher
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }
}

export default Auction;
