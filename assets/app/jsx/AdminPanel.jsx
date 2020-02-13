import React, {Component} from 'react';
import dataFetch from './DataFetch';
import {Form, Field} from 'react-final-form';
import io from 'socket.io-client';
import {notifyError, notifySuccess} from '../Common/common.js';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import ManageCatalog from './ManageCatalog.jsx';

const style = {
    formBox: {
        width: '600px',
        height: '600px',
        position: 'absolute',
        left: '45%',
        top: '50%',
        margin: '-300px 0 0 -150px'
    }
};

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
            deleteBid: [],
            autoPlay: false,
            currentIndex: -1
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
            const {sold, catalogs, owner_id, url_slug: namespace} = this.state;
            const data = {owner_id, namespace};
            socket.on('stopBiddingSuccess', (catalog, bidDetails) => {
                this.setState(
                    {
                        bidDetails
                    },
                    () => {
                        const {currentBid: final_price, bidHolderId: user_id} = this.state.bidDetails;
                        const {autoPlay, unsold} = this.state;
                        let data = {};
                        data.final_price = this.state.bidDetails.currentBid;
                        data.user_id = this.state.bidDetails.bidHolderId;
                        data.item_id = catalog.id;
                        data.isAuthRequired = true;
                        dataFetch('/saveAuctionSummary', data)
                            .then(response => {
                                if (response.status_code == 200) {
                                    notifySuccess("Sold successfully");
                                } else {
                                    notifyError('' + response.message);
                                }
                            })
                            .catch(err => {
                                notifyError('' + err.response);
                            });
                        if (this.state.sold.length === this.state.catalogs.length) {
                            this.closeAuction();
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

                if (autoPlay) {
                    this.markBiddingStart(unsold[currentIndex]);
                }
            });
        });
        socket.on('success', message => {
            notifySuccess(message);
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
        socket.on('successfullyDeleted', () => {
            notifySuccess('SuccessFully Deleted');
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
        const {sold, catalogs, owner_id, url_slug: namespace, unsold, autoPlay} = this.state;
        if (sold.includes(id)) {
            return;
        }
        let index = unsold.indexOf(id);
        index = (index + 1) % unsold.length;
        this.setState({
            currentIndex: index,
            start: '',
            allBids: [],
            pauseCatalog: ''
        });

        socket.emit('biddingSkip', owner_id, namespace, catalogName);
    };

    markSold = (event, id, catalog) => {
        event.preventDefault();
        const {sold, catalogs, owner_id, url_slug: namespace, unsold, autoPlay} = this.state;
        if (sold.includes(id)) {
            return;
        }
        sold.push(id);
        unsold.splice(unsold.indexOf(id), 1);
        this.setState(
            {
                sold,
                start: '',
                allBids: [],
                pauseCatalog: ''
            },
            () => {}
        );
        socket.emit('biddingStop', owner_id, namespace, catalog);

        if (autoPlay) {
            let nxtItemId;
            unsold.some(i => {
                if (parseInt(i) > parseInt(id)) {
                    nxtItemId = i;
                    return true;
                }
            });
            if (!nxtItemId) nxtItemId = unsold[0];
            this.markBiddingStart(nxtItemId);
        }
    };
    markBiddingStart = id => {
        this.setState(
            {
                start: id
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
    manageCatalog = () => {
        this.setState(
            {
                manageCatalog: !this.state.manageCatalog
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
            manageCatalog
        } = this.state;
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
                <div className="container" style={style.formBox}>
                    <ToastContainer
                        position="top-right"
                        hideProgressBar={true}
                        autoClose={4000}
                        newestOnTop={true}
                        closeOnClick={true}
                        draggable={false}
                        rtl={false}
                    />
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
                    <div className="d-flex justify-content-between">
                        <div>
                            <h2>AdminPanel : {url_slug}</h2>
                        </div>
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
                    </div>
                    <div className="row">
                        <div className="col-md-4 border-right">
                            <h5>
                                UsersCount: {clientIds.length}/{max_users}
                            </h5>
                            <h6>ActiveUsers:</h6>
                            <ul>
                                {activeUsers &&
                                    activeUsers.map(user => (
                                        <li
                                            className={`font-weight-bolder online-user-list ${
                                                !this.state.clientIds.includes(String(user.id))
                                                    ? 'text-red'
                                                    : 'text-success'
                                            }`}
                                            onClick={() => this.showUserDetail(user)}>
                                            {user.name}
                                        </li>
                                    ))}
                            </ul>
                        </div>
                        <div className="col-md-8">
                            <button className="btn btn-primary" onClick={this.openAuction} disabled={is_open}>
                                Open Auction
                            </button>
                            <button className="btn btn-danger" onClick={this.closeAuction} disabled={!is_open}>
                                Close Auction
                            </button>
                            {/* <button className="btn btn-warning" onClick={this.manageCatalog}>

                                {!manageCatalog ? 'Manage Catalog' : 'Back'}
                            </button> */}
                            <button
                                className="btn btn-warning"
                                data-toggle="modal"
                                data-target="#myModal"
                                onClick={this.manageCatalog}>
                                Manage Catalog
                            </button>
                            {this.state.is_open && (
                                <div className="mt-5">
                                    <div className="row">
                                        <div className="col-md-3 font-weight-bold text-center">Name</div>
                                        <div className="col-md-3 font-weight-bold text-center">Price</div>
                                        <div className="col-md-6 font-weight-bold text-center">Status</div>
                                    </div>
                                    {catalogs.map(catalog => (
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
                                                                    <button
                                                                        className="btn btn-danger m-1"
                                                                        disabled={start && start !== catalog.id}
                                                                        onClick={event => {
                                                                            pauseCatalog === catalog.id
                                                                                ? this.deleteBid(event, catalog)
                                                                                : this.markSold(
                                                                                      event,
                                                                                      catalog.id,
                                                                                      catalog
                                                                                  );
                                                                        }}>
                                                                        {pauseCatalog === catalog.id
                                                                            ? 'Delete'
                                                                            : 'Sold'}
                                                                    </button>
                                                                    {pauseCatalog === catalog.id ? (
                                                                        <button
                                                                            className="btn btn-danger m-1"
                                                                            disabled={pauseCatalog !== catalog.id}
                                                                            onClick={() =>
                                                                                this.markBiddingSkip(
                                                                                    event,
                                                                                    catalog.id,
                                                                                    catalog.name
                                                                                )
                                                                            }>
                                                                            Skip
                                                                        </button>
                                                                    ) : (
                                                                        <div />
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {pauseCatalog === catalog.id && allBids.length > 1 && (
                                                <div className="row">
                                                    <div className="col-md-3 font-weight-bold text-center">Bid</div>
                                                    <div className="col-md-3 font-weight-bold text-center">Name</div>
                                                    <div className="col-md-6 font-weight-bold text-center">Delete</div>
                                                </div>
                                            )}
                                            {pauseCatalog === catalog.id &&
                                                allBids &&
                                                allBids.map(
                                                    bid =>
                                                        bid.currentBid !== 0 && (
                                                            <div className="row">
                                                                <div className="col-md-3 text-center">
                                                                    {bid.currentBid}
                                                                </div>
                                                                <div className="col-md-3 text-center">
                                                                    {bid.bidHolderName}
                                                                </div>
                                                                <div className="col-md-6 text-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        name={`bidDelete&{bid.currentBid}`}
                                                                        checked={deleteBid.includes(
                                                                            bid.currentBid.toString()
                                                                        )}
                                                                        onChange={e => this.handleChecked(e)}
                                                                        id={bid.currentBid}
                                                                        value={bid.currentBid}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )
                                                )}
                                        </>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default AdminPanel;
