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
        dataFetch('/accessAuction', {url_slug: namespace, isAuthRequired: true})
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
                        data.isAuthRequired = true;
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
                notifyError('' + err.message);
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
            data.isAuthRequired = true;
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
        socket.on('registrationsClosed', () => {
            Swal.fire({
                icon: 'error',
                title: "Registrations Closed, Can't Join",
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
                bid_value: message.currentBid == 0 ? this.state.bid_value : message.currentBid,
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
        socket.on('joinedSuccessful', biddingPaused => {
            this.setState({
                loading: false,
                biddingPaused: biddingPaused
            });
        });
        socket.on('authError', () => {
            sessionStorage.clear();
            window.location.href = '/login';
        });
        socket.on('currentCatalog', catalog => {
            this.setState({
                catalog,
                bid_value: catalog.base_price
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

        socket.on('catalogSkip', catalogName => {
            Swal.fire({
                title: `${catalogName} has been skipped`,
                showCloseButton: true,
                timer: 3000
            });
            this.setState({
                catalog: ''
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
        let user = JSON.parse(sessionStorage.getItem('user'));
        let authParams = {};
        authParams.userIdForAuth = user.user_id;
        authParams.user_token = user.token;
        socket = io.connect({query: authParams});
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

    handleBid(bidAmount) {
        socket.emit('newBid', this.state.namespace, this.state.user_id, this.state.userName, bidAmount);
    }

    getBidAmount() {
        const {bid_value} = this.state;
        let bidString = bid_value + '';
        let divisor = Math.pow(10, bidString.length - 1);
        let digit = parseInt(bidString[0]);

        let newBid;
        if (digit == 1) {
            newBid = bid_value + divisor / 10;
        } else if (digit == 2) {
            newBid = bid_value + (divisor / 10) * 2;
        } else if (digit == 3 || digit == 4) {
            let divisor2 = divisor / 10;
            let digit2 = Math.floor(bid_value / divisor2) % 10;
            if (digit2 == 0 || digit2 == 8) {
                newBid = bid_value + (divisor / 10) * 2;
            } else if (digit2 == 2 || digit2 == 5) {
                newBid = bid_value + (divisor / 10) * 3;
            }
        } else {
            newBid = bid_value + (divisor / 10) * 5;
        }

        return newBid;
    }

    render() {
        let isCurrentBidByU = false;
        const {catalog, biddingPaused, bid_value} = this.state;
        if (this.state.user_id == this.state.currentBidHolder) {
            isCurrentBidByU = true;
        }
        let newBid = this.getBidAmount();
        let bidDiff = newBid - bid_value;
        return !this.state.loading ? (
            <div className={biddingPaused ? 'text-center pause-catalog' : 'text-center'} style={style.formBox}>
                <div className="pause-dialog">Auction is paused</div>
                <div className="d-flex justify-content-center">
                    <div className="pl-3">
                        <h2>Auction: {this.state.namespace}</h2>
                    </div>
                </div>
                <div className="container">
                    {this.state.is_open == false ? (
                        <p>Auction is either closed or not open yet!</p>
                    ) : (
                        <div>
                            {catalog ? (
                                <div className="mt-5 mb-5">
                                    <div className="card" style={{width: '300px'}}>
                                        <img
                                            className="card-img-top"
                                            src={
                                                catalog.thumbnail_url
                                                    ? catalog.thumbnail_url
                                                    : 'https://image.shutterstock.com/image-vector/auction-label-red-band-sign-260nw-1514047166.jpg'
                                            }
                                            alt="Card image"
                                        />
                                        <div className="card-body">
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
                                        <h3>
                                            CurrentBid:{' '}
                                            {this.state.bid_value == catalog.base_price ? '-' : this.state.bid_value}
                                        </h3>
                                        <h4>By: {isCurrentBidByU == true ? 'YOU' : this.state.bidHolderName}</h4>
                                        <button
                                            className="btn btn-primary"
                                            disabled={isCurrentBidByU}
                                            onClick={() => {
                                                this.handleBid(newBid);
                                            }}>
                                            Bid {newBid} (+{bidDiff})
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-danger">
                                    Wait for the admin to show you the catalog
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        ) : (
            <div className="align-content-center">Loading</div>
        );
    }
}

export default Auction;
