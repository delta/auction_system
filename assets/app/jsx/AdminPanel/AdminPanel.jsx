
import React, {Component} from 'react';
import dataFetch from '../DataFetch';
import {Form, Field} from 'react-final-form';
import io from 'socket.io-client';
import {notifyError, notifySuccess} from '../../Common/common.js';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import {Filter, ManageCatalog} from '../ManageCatalog.jsx';
import {style} from './style';
import Pagination from './createPagination';
let socket;

class AdminPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            q_type: 'get_config', //for selceting db operation
            owner_id: '',
            can_register: false,
            is_open: false,
            manageCatalog: false,
            url_slug: '',
            max_users: 0,
            catalogs: [],
            sold: [],
            start: '',
            activeUsers: [],
            clientIds: [],
            selectedUser: '',
            access_type: 'public',
            password: '',
            pauseCatalog: '',
            allBids: [],
            secretBids: [],
            deleteBid: [],
            deleteSecretBids: [],
            autoPlay: false,
            currentIndex: -1,
            currentCatalog: '',
            isSecretBid: false ,
            posts: [],
            currentPage: 1,
            postsPerPage: 7,

        };
        this.onSubmit = this.onSubmit.bind(this);
        this.openAuction = this.openAuction.bind(this);
        this.closeAuction = this.closeAuction.bind(this);
    }

    componentDidMount() {
        this.initConfig();
    }

    initConfig() {
        let user = JSON.parse(sessionStorage.getItem('user'));
        if (user == null || user.role != 'Admin') {
            window.location.href = '/login';
        } else {
            let data = {};
            data.user_id = user.user_id;
            data.q_type = 'get_config';
            data.isAuthRequired = true;
            //prefetch config details, if it's in db
            dataFetch('/getAuctionConfig', data)
                .then(response => {
                    if (response.status_code == 200 && response.message !== null) {
                        let data = response.message;

                        //update state values;
                        this.setState(
                            {
                                owner_id: user.user_id,
                                q_type: 'update_config',
                                can_register: data.can_register == 1 ? true : false,
                                is_open: data.is_open == 1 ? true : false,
                                url_slug: data.auction_url,
                                max_users: data.max_users,
                                access_type: data.access_type,
                                auction_id: data.id
                            },
                            () => {
                                if (this.state.is_open) {
                                    this.openAuction();
                                }
                            }
                        );
                    } else {
                        this.setState({
                            owner_id: user.user_id,
                            q_type: 'add_config'
                        });
                    }
                })
                .catch(err => {
                    notifyError('' + err.response);
                });
        }
    }

    onSubmit = values => {
        const {access_type, password} = this.state;
        let data = {...values};
        data.q_type = this.state.q_type;
        data.user_id = this.state.owner_id;
        data.isAuthRequired = true;
        dataFetch('/addAuctionConfig', data)
            .then(response => {
                if (response.status_code == '200') {
                    this.setState({
                        q_type: 'update_config',
                        can_register: values.can_register == 1 ? true : false,
                        is_open: values.is_open == 1 ? true : false,
                        url_slug: values.url_slug,
                        max_users: values.max_users,
                        auction_id: response.message.id,
                        access_type: values.access_type ? values.access_type : access_type,
                        password: values.access_type === 'private' ? values.password : password
                    });
                } else {
                    notifyError(response.message);
                }
            })
            .catch(err => {
                notifyError('' + err.response);
            });
    };

    getCatalog = data => {
        if (this.state.is_open) {
            data.isAuthRequired = true;
            dataFetch('/getCatalog', data)
                .then(response => {
                    if (response.status_code == 200) {
                        const unsold = response.message.filter(catalog => !catalog.sold).map(c => c.id);
                        const sold = response.message.filter(catalog => catalog.sold).map(c => c.id);
                        this.setState(
                            {
                                catalogs: response.message,
                                unsold: unsold,
                                sold: sold
                            },
                            () => {
                                this.getRegisteredUser();
                            }
                        );
                    } else {
                        notifyError('' + response.message);
                    }
                })
                .catch(err => {
                    notifyError('' + err.response);
                });
        }
    };
    getRegisteredUser = () => {
        dataFetch('/getRegisteredUser', {
            auction_id: this.state.auction_id,
            isAuthRequired: true
        })
            .then(users => {
                const arrId = users.message.map(user => String(user.user_id));
                let queryParams = {};
                queryParams.isAuthRequired = true;
                queryParams.ids = arrId;
                dataFetch('/getUserDetails', queryParams)
                    .then(response => {
                        if (response.status_code == 200) {
                            this.setState({
                                activeUsers: response.message
                            });
                        } else {
                            notifyError('' + response.message);
                        }
                    })
                    .catch(err => {
                        notifyError('' + err.message);
                    });
            })
            .catch(err => {
                notifyError('' + err.response);
            });
    };
    openAuction() {
        //update auctionConfig
        let data = {...this.state};
        data.is_open = true;
        data.isAuthRequired = true;
        dataFetch('/updateAuctionConfig', data)
            .then(response => {
                if (response.status_code == 200) {
                    this.setState(
                        {
                            is_open: true
                        },
                        () => {
                            this.getCatalog(data);
                        }
                    );
                } else {
                    notifyError(response.message);
                }
            })
            .catch(err => {
                notifyError('' + err.response);
            });

        socket = io.connect();
        socket.on('connect', () => {
            let configData = {};
            configData.max_users = this.state.max_users;
            configData.url_slug = this.state.url_slug;
            configData.owner_id = this.state.owner_id;
            configData.can_register = this.state.can_register;
            configData.is_open = this.state.is_open;

            socket.emit('openAuction', configData);
        });

        socket.on('stopBiddingSuccess', (catalog, bidDetails) => {
            notifySuccess('Sold successfully');

            const {sold, unsold, autoPlay, currentIndex} = this.state;

            sold.push(catalog.id);
            unsold.splice(unsold.indexOf(catalog.id), 1);

            this.setState(
                {
                    bidDetails,
                    sold,
                    start: '',
                    allBids: [],
                    pauseCatalog: '',
                    secretBids: [],
                    deleteSecretBids: [],
                    isSecretBid: false
                },
                () => {
                    if (this.state.sold.length === this.state.catalogs.length) {
                        this.closeAuction();
                    }

                    if (autoPlay) {
                        let nxtItemId;
                        unsold.some(i => {
                            if (parseInt(i) > parseInt(catalog.id)) {
                                nxtItemId = i;
                                return true;
                            }
                        });
                        if (!nxtItemId) nxtItemId = unsold[0];
                        this.markBiddingStart(nxtItemId);
                    }
                }
            );
        });

        socket.on('skipBiddingSuccess', catalogName => {
            notifySuccess('Catalog Skipped');
            const {autoPlay, currentIndex, unsold} = this.state;
            if (currentIndex < 0 || currentIndex > unsold.length) {
                return;
            }

            this.setState(
                {
                    start: '',
                    allBids: [],
                    pauseCatalog: ''
                },
                () => {
                    if (autoPlay) {
                        this.markBiddingStart(unsold[currentIndex]);
                    }
                }
            );
        });

        socket.on('onlineUsers', message => {
            dataFetch('/getRegisteredUser', {
                auction_id: this.state.auction_id,
                isAuthRequired: true
            })
                .then(users => {
                    const arrId = users.message.map(user => String(user.user_id));
                    this.setState({
                        clientIds: message
                    });
                    const mergeArray = Array.from(new Set([...message, ...arrId]));
                    let idData = {ids: mergeArray};
                    idData['isAuthRequired'] = true;
                    dataFetch('/getUserDetails', idData)
                        .then(response => {
                            if (response.status_code == 200) {
                                this.setState({
                                    activeUsers: response.message
                                });
                            } else {
                                notifyError('' + response.message);
                            }
                        })
                        .catch(err => {
                            notifyError('' + err.response);
                        });
                })
                .catch(err => {
                    notifyError('' + err.response);
                });
        });

        socket.on('allBids', bidDetails => {
            this.setState({
                allBids: bidDetails.reverse()
            });
        });

        socket.on('currentAllSecretBids', secretBids => {
            this.setState({
                secretBids: secretBids
            });
        });

        socket.on('successfullyDeleted', () => {
            notifySuccess('SuccessFully Deleted');
        });

        socket.on('success', message => {
            notifySuccess(message);
        });

        socket.on('notifyError', errorMessage => {
            notifyError(errorMessage);
        });

        socket.on('currentAllBids', allBids => {
            this.setState({
                allBids: allBids.reverse()
            });
        });

        socket.on('currentCatalog', catalog => {
            this.setState({
                currentCatalog: catalog
            });
        });

        socket.on('currentBidStatus', message => {
            this.setState({
                bid_value: message.currentBid == 0 ? this.state.bid_value : message.currentBid,
                currentBidHolder: message.bidHolderId,
                bidHolderName: message.bidHolderName
            });
        });
    }

    closeAuction() {
        //update auctionConfig
        let data = {...this.state};
        data.is_open = false;
        data.isAuthRequired = true;
        dataFetch('/updateAuctionConfig', data)
            .then(response => {
                if (response.status_code == 200) {
                    this.setState({
                        is_open: false,
                        activeUsers: [],
                        selectedUsers: '',
                        clientIds: []
                    });
                } else {
                    notifyError('' + response.message);
                }
            })
            .catch(err => {
                notifyError('' + response.message);
            });

        //emit close auction
        socket.emit('closeAuction', this.state.url_slug, this.state.owner_id);
    }
    showUserDetail = user => {
        this.setState(
            {
                selectedUser: user
            },
            () => {
                const {selectedUser} = this.state;
                Swal.fire({
                    title: 'User Details',
                    html: `
            <hr/>
            <table>
            <tr>
                <td>Name: </td>
                <td>${selectedUser.name}</td>
            </tr>
            <tr>
                <td>Email: </td>
                <td>${selectedUser.email}</td>
            </tr>
            <tr>
                <td>Contact: </td>
                <td>${selectedUser.contact}</td>
            </tr>
            <tr>
                <td>Country: </td>
                <td>${selectedUser.country}</td>
            </tr>
            </table>
        `,
                    showClass: {
                        popup: 'animated fadeInDown faster'
                    },
                    hideClass: {
                        popup: 'animated fadeOutUp faster'
                    }
                });
            }
        );
    };

    markBiddingSkip = (event, id, catalogName) => {
        event.preventDefault();
        const {sold, owner_id, url_slug: namespace, unsold} = this.state;
        if (sold.includes(id)) {
            return;
        }
        let index = unsold.indexOf(id);
        index = (index + 1) % unsold.length;
        this.setState({
            currentIndex: index
        });

        socket.emit('biddingSkip', owner_id, namespace, catalogName);
    };

    markSold = (event, id, catalog) => {
        event.preventDefault();
        const {sold, owner_id, url_slug: namespace, isSecretBid} = this.state;
        if (sold.includes(id)) {
            return;
        }
        socket.emit('biddingStop', owner_id, namespace, catalog, isSecretBid);
    };

    markBiddingStart = id => {
        this.setState(
            {
                start: id,
                isSecretBid: false
            },
            () => {
                const {catalogs, start, url_slug, owner_id} = this.state;
                let catalog = catalogs.filter(catalog => catalog.id === start);
                socket.emit('biddingStart', url_slug, owner_id, catalog[0]);
            }
        );
    };
    markPause = catalog => {
        const {owner_id, url_slug} = this.state;
        this.setState({
            pauseCatalog: catalog.id
        });
        socket.emit('pauseBidding', owner_id, url_slug, catalog);
    };
    markResume = catalog => {
        const {owner_id, url_slug} = this.state;
        this.setState({
            pauseCatalog: ''
        });
        socket.emit('resumeBidding', owner_id, url_slug, catalog);
    };

    startSecretBid = catalog => {
        this.setState({isSecretBid: true}, () => {
            const {owner_id, url_slug, isSecretBid} = this.state;
            socket.emit('secretBidStatus', owner_id, url_slug, catalog, isSecretBid);
        });
    };

    stopSecretBid = catalog => {
        this.setState({isSecretBid: false}, () => {
            const {owner_id, url_slug, isSecretBid} = this.state;
            socket.emit('secretBidStatus', owner_id, url_slug, catalog, isSecretBid);
        });
    };

    deleteBid = (event, catalog) => {
        event.preventDefault();
        let {deleteBid, allBids, owner_id, url_slug} = this.state;
        deleteBid.forEach(bid => {
            allBids = allBids.filter(Bid => Bid.currentBid != bid);
        });
        this.setState({
            allBids,
            deleteBid: []
        });
        socket.emit('deleteBids', allBids, owner_id, url_slug, catalog);
    };

    deleteSecretBids = (event, catalog) => {
        event.preventDefault();
        let {deleteSecretBids, secretBids, owner_id, url_slug} = this.state;
        deleteSecretBids.forEach(bid => {
            secretBids = secretBids.filter(Bid => Bid.bidHolderId != bid);
        });
        this.setState({
            secretBids,
            deleteSecretBids: []
        });
        socket.emit('deleteSecretBids', secretBids, deleteSecretBids, owner_id, url_slug, catalog);
    };
    handleChecked = e => {
        let id = e.target.id;
        const {deleteBid} = this.state;
        let index = deleteBid.indexOf(id);
        if (index > -1) {
            deleteBid.splice(index, 1);
        } else {
            deleteBid.push(id);
        }
        this.setState({
            deleteBid
        });
    };

    handleSecretChecked = e => {
        let id = e.target.id;
        const {deleteSecretBids} = this.state;
        let index = deleteSecretBids.indexOf(id);
        if (index > -1) {
            deleteSecretBids.splice(index, 1);
        } else {
            deleteSecretBids.push(id);
        }
        this.setState({
            deleteSecretBids
        });
    };
    manageCatalog = () => {
        this.setState(
            {
                manageCatalog: true
            },
            () => {
                if (!this.state.manageCatalog) {
                    this.getCatalog({owner_id: this.state.owner_id});
                }
            }
        );
    };

    toggleAutoPlay = () => {
        this.setState({
            autoPlay: !this.state.autoPlay
        });
    };

    toggleRegistrationStatus = () => {
        //update auctionConfig
        let data = {...this.state};
        data.can_register = !this.state.can_register;
        data.isAuthRequired = true;
        dataFetch('/updateAuctionConfig', data)
            .then(response => {
                if (response.status_code == 200) {
                    this.setState({
                        can_register: !this.state.can_register
                    });

                    notifySuccess(response.message);

                    //emit close auction
                    socket.emit('changeRegistrationStatus', this.state.url_slug);
                } else {
                    notifyError('' + response.message);
                }
            })
            .catch(err => {
                notifyError('' + response.message);
            });
    };

    render() {
        const {
            activeUsers,
            q_type,
            clientIds,
            catalogs,
            sold,
            start,
            url_slug,
            max_users,
            is_open,
            can_register,
            access_type,
            password,
            pauseCatalog,
            allBids,
            deleteBid,
            manageCatalog,
            isSecretBid,
            secretBids,
            deleteSecretBids,
            postsPerPage,
            currentPage
        } = this.state;
        const indexOfLastPost= currentPage*postsPerPage;
        const indexOfFirstPost =indexOfLastPost - postsPerPage;
       const filterData=catalogs.filter(
        catalog =>{
          if(this.state.filterString != undefined){
         return  catalog.name.includes(
              this.state.filterString)
            } else {
              return true
            }
        }
      );
       const currentPost = filterData.slice(indexOfFirstPost , indexOfLastPost);
       console.log(currentPost,catalogs.length,indexOfFirstPost , indexOfLastPost);
       console.log(catalogs);
       const paginate = pageNumber => this.setState({currentPage:pageNumber});
        if (q_type == 'add_config') {
            return (
                <div>
                    <div className="container" style={style.formBox}>
                    <h2>AdminPanel :)</h2>
                        <Form
                            onSubmit={this.onSubmit}
                            initialValues={{
                                url_slug,
                                max_users,
                                is_open,
                                can_register,
                                access_type,
                                password
                            }}
                            validate={values => {
                                const errors = {};
                                if (!values.url_slug) {
                                    errors.url_slug = 'Required';
                                } else if (!values.max_users) {
                                    errors.max_users = 'Required';
                                } else if (values.max_users <= 0) {
                                    errors.max_users = "Max User can't be zero or less then zero";
                                } else if (values.access_type === 'private' && !values.password) {
                                    errors.password = 'Required';
                                }
                                return errors;
                            }}
                            render={({handleSubmit, form, submitting, values}) => (
                                <form onSubmit={handleSubmit}>
                                    <Field name="url_slug">
                                        {({input, meta}) => (
                                            <div className="form-row">
                                                <label>Auction Slug:</label>
                                                <input
                                                    className="form-control"
                                                    {...input}
                                                    type="text"
                                                    placeholder="Username"
                                                />
                                                {meta.error && meta.touched && <span>{meta.error}</span>}
                                            </div>
                                        )}
                                    </Field>
                                    <Field name="max_users">
                                        {({input, meta}) => (
                                            <div className="form-row">
                                                <label>Maximum Users:</label>
                                                <input
                                                    className="form-control"
                                                    {...input}
                                                    type="number"
                                                    placeholder="Password"
                                                />
                                                {meta.error && meta.touched && <span>{meta.error}</span>}
                                            </div>
                                        )}
                                    </Field>
                                    <label>Access Type:</label>
                                    <br />
                                    <Field name="access_type" className="form-row form-control" component="select">
                                        <option value="public">Public</option>
                                        <option value="private">Private</option>
                                    </Field>
                                    {values.access_type === 'private' && (
                                        <Field name="password">
                                            {({input, meta}) => (
                                                <div className="form-row">
                                                    <label>Password</label>
                                                    <input className="form-control" {...input} type="password" />
                                                    {meta.error && meta.touched && <span>{meta.error}</span>}
                                                </div>
                                            )}
                                        </Field>
                                    )}
                                    <div className="from-row">
                                        <button className="btn btn-primary" type="submit" disabled={submitting}>
                                            {q_type == 'add_config' ? 'Add' : 'Update'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        />
                    </div>
                </div>
            );
        } else {
            return (
                <div style={style.container}>
                    <div style={style.header}>
                        <button className="btn btn-primary" onClick={this.openAuction} disabled={is_open}>
                            Open Auction
                        </button>
                        <button className="btn btn-danger" onClick={this.closeAuction} disabled={!is_open}>
                            Close Auction
                        </button>
                        <div>
                            <h2>AdminPanel : {url_slug}</h2>
                        </div>
                        <button
                            className="btn btn-warning"
                            data-toggle="modal"
                            data-target="#myModal"
                            onClick={this.manageCatalog}>
                            Manage Catalog
                        </button>
                        <div>
                            <input type="checkbox" data-toggle="toggle" onChange={this.toggleAutoPlay} />
                            AutoPlay
                        </div>
                        <div>
                            <input
                                type="checkbox"
                                data-toggle="toggle"
                                onChange={this.toggleRegistrationStatus}
                                checked={this.state.can_register}
                            />
                            Registration Status
                        </div>
                        <div>
                        <Filter onTextChange={
                          text=> this.setState({filterString : text})
                        }/>
                        </div>
                    </div>

                    <div style={style.topContainer}>
                        <div style={style.catalogsContainer}>
                            {this.state.is_open && (
                                <div className="mt-5">
                                    <div className="row">
                                        <div className="col-md-3 font-weight-bold text-center">Name</div>
                                        <div className="col-md-3 font-weight-bold text-center">Price</div>
                                        <div className="col-md-6 font-weight-bold text-center">Status</div>
                                    </div>

                                    {currentPost.map(catalog => (
                                        <>
                                            <div className="row mb-1" key={catalog.id}>
                                                <div className="col-md-3 p-2 text-center">{catalog.name}</div>
                                                <div className="col-md-3 p-2 text-center">{catalog.base_price}</div>
                                                <div className="col-md-6  text-center">
                                                    {sold.includes(catalog.id) ? (
                                                        'SOLD'
                                                    ) : (
                                                        <div>
                                                            {start !== catalog.id && (
                                                                <button
                                                                    className="btn btn-success m-1"
                                                                    disabled={start && start !== catalog.id}
                                                                    onClick={() => this.markBiddingStart(catalog.id)}>
                                                                    Start
                                                                </button>
                                                            )}
                                                            {start === catalog.id && (
                                                                <>
                                                                    <button
                                                                        className="btn btn-danger m-1"
                                                                        disabled={start && start !== catalog.id}
                                                                        onClick={event => {
                                                                            pauseCatalog === catalog.id
                                                                                ? this.markResume(catalog)
                                                                                : this.markPause(catalog);
                                                                        }}>
                                                                        {pauseCatalog === catalog.id
                                                                            ? 'Resume'
                                                                            : 'Pause'}
                                                                    </button>
                                                                    {pauseCatalog === catalog.id ? (
                                                                        <>
                                                                            {!isSecretBid ? (
                                                                                <>
                                                                                    <button
                                                                                        className="btn btn-danger m-1"
                                                                                        disabled={
                                                                                            start &&
                                                                                            start !== catalog.id
                                                                                        }
                                                                                        onClick={event => {
                                                                                            this.deleteBid(
                                                                                                event,
                                                                                                catalog
                                                                                            );
                                                                                        }}>
                                                                                        Delete
                                                                                    </button>
                                                                                    <button
                                                                                        className="btn btn-danger m-1"
                                                                                        disabled={
                                                                                            start &&
                                                                                            start !== catalog.id
                                                                                        }
                                                                                        onClick={() =>
                                                                                            this.markSold(
                                                                                                event,
                                                                                                catalog.id,
                                                                                                catalog
                                                                                            )
                                                                                        }>
                                                                                        Sold
                                                                                    </button>
                                                                                    <button
                                                                                        className="btn btn-danger m-1"
                                                                                        disabled={
                                                                                            pauseCatalog !== catalog.id
                                                                                        }
                                                                                        onClick={() =>
                                                                                            this.markBiddingSkip(
                                                                                                event,
                                                                                                catalog.id,
                                                                                                catalog.name
                                                                                            )
                                                                                        }>
                                                                                        Skip
                                                                                    </button>
                                                                                    <button
                                                                                        className="btn btn-danger m-1"
                                                                                        disabled={
                                                                                            pauseCatalog !== catalog.id
                                                                                        }
                                                                                        onClick={() =>
                                                                                            this.startSecretBid(catalog)
                                                                                        }>
                                                                                        Secret Bid
                                                                                    </button>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <button
                                                                                        className="btn btn-danger m-1"
                                                                                        disabled={
                                                                                            pauseCatalog !== catalog.id
                                                                                        }
                                                                                        onClick={() =>
                                                                                            this.stopSecretBid(catalog)
                                                                                        }>
                                                                                        Stop Secret Bid
                                                                                    </button>
                                                                                    <button
                                                                                        className="btn btn-danger m-1"
                                                                                        disabled={
                                                                                            start &&
                                                                                            start !== catalog.id
                                                                                        }
                                                                                        onClick={event => {
                                                                                            this.deleteSecretBids(
                                                                                                event,
                                                                                                catalog
                                                                                            );
                                                                                        }}>
                                                                                        Delete
                                                                                    </button>
                                                                                    <button
                                                                                        className="btn btn-danger m-1"
                                                                                        disabled={
                                                                                            start &&
                                                                                            start !== catalog.id
                                                                                        }
                                                                                        onClick={() =>
                                                                                            this.markSold(
                                                                                                event,
                                                                                                catalog.id,
                                                                                                catalog
                                                                                            )
                                                                                        }>
                                                                                        Sold
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <div />
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="modal fade" id="myModal" role="dialog">
                            <div className="modal-dialog modal-lg">
                                <div className="modal-content">
                                    <div className="modal-header d-flex justify-content-between">
                                        <div>Manage Catalog</div>
                                        <div onClick={this.manageCatalog}>
                                            <button
                                                type="button"
                                                className="close"
                                                data-toggle="modal"
                                                data-target="#myModal"
                                                aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="modal-body">
                                        {manageCatalog && (
                                            <ManageCatalog
                                                owner_id={this.state.owner_id}
                                                catalogId={this.state.start}
                                                updateCatalog={data => {
                                                    this.getCatalog(data);
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={style.currentBidContainer}>
                            {this.state.currentCatalog ? (
                                <div className="card" style={{width: '300px'}}>
                                    <img
                                        className="card-img-top"
                                        src={
                                            this.state.currentCatalog.thumbnail_url
                                                ? this.state.currentCatalog.thumbnail_url
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
                                            <div className="col-md-6 text-capitalize">
                                                {this.state.currentCatalog.name}
                                            </div>
                                            <div className="col-md-6 text-capitalize">
                                                {this.state.currentCatalog.base_price}
                                            </div>
                                        </div>
                                        {!isSecretBid
                                           ? (
                                            <>
                                                <h3>
                                                    CurrentBid:{' '}
                                                    {this.state.bid_value == this.state.currentCatalog.base_price
                                                        ? '-'
                                                        : this.state.bid_value}
                                                </h3>
                                                <h4>By: {this.state.bidHolderName}</h4>
                                            </>
                                        ) : (
                                            <div />
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-danger">Yet to start the bidding</div>
                            )}
                        </div>

                        {isSecretBid ? (
                            <div style={style.allBidsContainer}>
                                {secretBids.length > 0 && (
                                    <div className="row">
                                        <div className="col-md-3 font-weight-bold text-center">Name</div>
                                        <div className="col-md-6 font-weight-bold text-center">Delete</div>
                                    </div>
                                )}
                                {secretBids &&
                                    secretBids.map(
                                        bid =>
                                            bid.currentBid !== 0 && (
                                                <div className="row">
                                                    <div className="col-md-3 text-center">{bid.bidHolderName}</div>
                                                    <div className="col-md-6 text-center">
                                                        <input
                                                            type="checkbox"
                                                            name={`bidDelete&{bid.bidGolderId}`}
                                                            checked={deleteSecretBids.includes(
                                                                bid.bidHolderId.toString()
                                                            )}
                                                            onChange={e => this.handleSecretChecked(e)}
                                                            id={bid.bidHolderId}
                                                            value={bid.bidHolderId}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                    )}
                            </div>
                        ) : (
                            <div style={style.allBidsContainer}>
                                {allBids.length > 1 && (
                                    <div className="row">
                                        <div className="col-md-3 font-weight-bold text-center">Bid</div>
                                        <div className="col-md-3 font-weight-bold text-center">Name</div>
                                        <div className="col-md-6 font-weight-bold text-center">Delete</div>
                                    </div>
                                )}
                                {allBids &&
                                    allBids.map(
                                        bid =>
                                            bid.currentBid !== 0 && (
                                                <div className="row">
                                                    <div className="col-md-3 text-center">{bid.currentBid}</div>
                                                    <div className="col-md-3 text-center">{bid.bidHolderName}</div>
                                                    <div className="col-md-6 text-center">
                                                        <input
                                                            type="checkbox"
                                                            name={`bidDelete&{bid.currentBid}`}
                                                            checked={deleteBid.includes(bid.currentBid.toString())}
                                                            onChange={e => this.handleChecked(e)}
                                                            id={bid.currentBid}
                                                            value={bid.currentBid}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                    )}
                            </div>
                        )}
                    </div>

                    <div style={style.activeUsersContainer}>
                    <div className="row">
                    <Pagination className= "col-md-3" postsPerPage={postsPerPage} totalPosts = {catalogs.length} paginate={paginate}/>
                        <h5 className="col-md-12">
                            Active Users: {clientIds.length}/{max_users}
                        </h5>
                        <div style={style.usersGrid}>
                            {activeUsers &&
                                activeUsers.map(user => (
                                    <div
                                        style={style.userListItem}
                                        className={`font-weight-bolder online-user-list ${
                                            !this.state.clientIds.includes(String(user.id))
                                                ? 'text-red'
                                                : 'text-success'
                                        }`}
                                        onClick={() => this.showUserDetail(user)}>
                                        {user.name}
                                    </div>
                                ))}
                        </div>
                    </div>
                    </div>
                </div>
            );
        }
    }
}

export default AdminPanel;
