import React, {Component} from 'react';
import dataFetch from './DataFetch';
import io from 'socket.io-client';
import Swal from 'sweetalert2';
import {notifyError} from '../Common/common';

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
            loading: true,
            user_id: '',
            userName: '',
            namespace: '',
            bid_value: 0,
            currentBidHolder: '',
            bidHolderName: '',
            is_open: false,
            biddingPaused: false
        };
        this.handleBid = this.handleBid.bind(this);
    }

    componentDidMount() {
        this.checkStatus();
    }
    isAuthenticated = () => {
        const {namespace} = this.state;
        dataFetch('/accessAuction', {url_slug: namespace})
            .then(auction => {
                if (auction.message.access_type === 'private') {
                    Swal.fire({
                        title: 'Password',
                        input: 'text',
                        inputAttributes: {
                            autocapitalize: 'off'
                        },
                        showCancelButton: true,
                        confirmButtonText: 'Join',
                        showLoaderOnConfirm: true
                    }).then(response => {
                        if (response.dismiss == 'cancel') {
                            this.props.history.push('/home');
                            return;
                        }
                        let data = {password: response.value, auction_url: namespace};
                        dataFetch('/authorizeAuction', data)
                            .then(data => {
                                if (data.message.verified) {
                                    this.socketHandler();
                                } else {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Oops...',
                                        text: 'Incorrect Password'
                                    });
                                    this.props.history.push('/home');
                                }
                            })
                            .catch(err => {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Oops...',
                                    text: err
                                });
                            });
                    });
                } else if (auction.message.access_type === 'public') {
                    this.socketHandler();
                }
            })
            .catch(err => {
                notifyError(err.message);
            });
    };

    socketHandler = () => {
        this.socketConnect();
        socket.on('connect', () => {
            //once connected to server, join particular room
            const data = {
                user_id: this.state.user_id,
                auction_id: parseInt(this.props.match.params.id)
            };
            dataFetch('/userAuctionRegistration', data).then(user => {
                socket.emit('joinRoom', this.state.namespace, this.state.user_id);
            });
        });
        socket.on('max_limit_exceeded', () => {
            Swal.fire({
                icon: 'error',
                title: "Auction Full, Can't Join",
                showClass: {
                    popup: 'animated fadeInDown faster'
                },
                hideClass: {
                    popup: 'animated fadeOutUp faster'
                }
            });
            this.props.history.push('/home');
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
                is_open: false,
                biddingPaused: false
            });
            socket.close();
        });
        socket.on('joinedSuccessful', () => {
            this.setState({
                loading: false
            });
        });
        socket.on('currentCatalog', catalog => {
            this.setState({
                catalog
            });
        });
        socket.on('startAuction', catalog => {
            this.setState({
                catalog: ''
            });
        });
        socket.on('currentCatalogSold', catalog => {
            this.setState({
                catalog
            });
        });
        socket.on('pausedBidding', () => {
            this.setState({
                biddingPaused: true
            });
        });
        socket.on('resumeBidding', () => {
            this.setState({
                biddingPaused: false
            });
        });
        socket.on('catalogSold', (catalogName, bidDetails) => {
            Swal.fire({
                title: `${bidDetails.bidHolderName} buy ${catalogName} at ${bidDetails.currentBid}`,
                showConfirmButton: true,
                timer: 3000
            });
        });
    };

    socketConnect() {
        socket = io.connect();
    }

    checkStatus() {
        let {url_slug} = this.props.match.params;
        let user = JSON.parse(sessionStorage.getItem('user'));
        if (user == null || user.role != 'User') {
            window.location.href = '/login';
        } else {
            this.setState(
                {
                    user_id: user.user_id,
                    userName: user.username,
                    namespace: url_slug
                },
                () => {
                    this.isAuthenticated();
                }
            );
        }
    }

    handleBid() {
        socket.emit('newBid', this.state.namespace, this.state.user_id, this.state.userName, this.state.bid_value + 1);
    }

    render() {
        let isCurrentBidByU = false;
        const {catalog, biddingPaused} = this.state;
        if (this.state.user_id == this.state.currentBidHolder) {
            isCurrentBidByU = true;
        }
        return (
            <div className={biddingPaused ? 'text-center pause-catalog' : 'text-center'} style={style.formBox}>
                <div className="pause-dialog">Auction is pause, Wait for resume</div>
                <h2>Auction: {this.state.namespace}</h2>
                <div className="container">
                    {this.state.is_open == false ? (
                        <p>Auction is either closed or not open yet!</p>
                    ) : (
                        <div>
                            {catalog && (
                                <div className="mt-5 mb-5">
                                    <h5>Catalog Details</h5>

                                    <div className="row font-weight-bold">
                                        <div className="col-md-6 text-capitalize">Name</div>
                                        <div className="col-md-6 text-capitalize">Base Price</div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 text-capitalize">{catalog.name}</div>
                                        <div className="col-md-6 text-capitalize">{catalog.base_price}</div>
                                    </div>
                                </div>
                            )}
                            {catalog ? (
                                <>
                                    <h3>CurrentBid: {this.state.bid_value}</h3>
                                    <h4>By: {isCurrentBidByU == true ? 'YOU' : this.state.bidHolderName}</h4>
                                    <button
                                        className="btn btn-primary"
                                        disabled={isCurrentBidByU}
                                        onClick={this.handleBid}>
                                        Bid Higher
                                    </button>
                                </>
                            ) : (
                                <div className="text-center text-danger">
                                    Wait for the admin to show you the catalog
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default Auction;
