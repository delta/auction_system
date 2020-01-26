import React, {Component} from 'react';
import dataFetch from './DataFetch';
import {Form, Field} from 'react-final-form';
import io from 'socket.io-client';
import {notifyError, notifySuccess} from '../Common/common.js';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

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
            url_slug: '',
            max_users: 0,
            catalogs: [],
            sold: [],
            start: '',
            activeUsers: [],
            clientIds: [],
            selectedUser: '',
            access_type: 'public',
            password: ''
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
                    notifyError(err.response);
                });
        }
    }

    onSubmit = values => {
        const {access_type, password} = this.state;
        let data = {...values};
        data.q_type = this.state.q_type;
        data.user_id = this.state.owner_id;
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
                notifyError(err.response);
            });
    };
    getCatalog = data => {
        if (this.state.is_open) {
            dataFetch('/getCatalog', data)
                .then(response => {
                    if (response.status_code == 200) {
                        this.setState({
                            catalogs: response.message
                        });
                    } else {
                        notifyError(response.message);
                    }
                })
                .catch(err => {
                    notifyError(err.response);
                });
        }
    };
    openAuction() {
        //update auctionConfig
        let data = {...this.state};
        data.is_open = true;
        dataFetch('/updateAuctionConfig', data)
            .then(response => {
                if (response.status_code == 200) {
                    this.setState(
                        {
                            is_open: true
                        },
                        () => {
                            this.getCatalog(data);
                            notifySuccess(response.message);
                        }
                    );
                } else {
                }
            })
            .catch(err => {
                notifyError(err.response);
            });

        socket = io.connect();
        socket.on('connect', () => {
            socket.emit('openAuction', this.state.url_slug, this.state.owner_id, this.state.max_users);
            const {sold, catalogs, owner_id, url_slug: namespace} = this.state;
            const data = {owner_id, namespace};
            socket.on('stopBiddingSuccess', bidDetails => {
                this.setState(
                    {
                        bidDetails
                    },
                    () => {
                        const {currentBid: final_price, bidHolderId: user_id} = this.state.bidDetails;
                        data.final_price = final_price;
                        data.user_id = user_id;
                        data.item_id = sold[sold.length - 1];
                        dataFetch('/saveAuctionSummary', data)
                            .then(response => {
                                if (response.status_code == 200) {
                                    notifySuccess(response.message);
                                } else {
                                    notifyError(response.message);
                                }
                            })
                            .catch(err => {
                                notifyError(err.response);
                            });
                        if (sold.length === catalogs.length) {
                            this.closeAuction();
                        }
                    }
                );
            });
        });
        socket.on('success', message => {
            notifySuccess(message);
        });
        socket.on('onlineUsers', message => {
            dataFetch('/getRegisteredUser', {
                auction_id: this.state.auction_id
            }).then(users => {
                const arrId = users.message.map(user => String(user.user_id));
                this.setState({
                    clientIds: message
                });
                const mergeArray = Array.from(new Set([...message, ...arrId]));
                const idData = {ids: mergeArray};
                dataFetch('/getUserDetails', idData)
                    .then(response => {
                        if (response.status_code == 200) {
                            this.setState({
                                activeUsers: response.message
                            });
                        } else {
                            notifyError('Error Fetching Active User');
                        }
                    })
                    .catch(err => {
                        notifyError(err.response);
                    });
            });
        });
    }

    closeAuction() {
        //update auctionConfig
        let data = {...this.state};
        data.is_open = false;
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
                    notifyError(response.message);
                }
            })
            .catch(err => {
                notifyError(response.message);
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

    markSold = (event, id) => {
        event.preventDefault();
        const {sold, catalogs, owner_id, url_slug: namespace} = this.state;
        if (sold.includes(id)) {
            return;
        }
        sold.push(id);
        this.setState({
            sold,
            start: ''
        });
        socket.emit('biddingStop', owner_id, namespace);
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
            password
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
                                    {/* <Field name="is_open">
                    {({ input, meta }) => (
                      <div className="form-row">
                        <label>Auction Open:</label>
                        <input className="form-control" {...input} type="checkbox" placeholder="Confirm" />
                        {meta.error && meta.touched && <span>{meta.error}</span>}
                      </div>
                    )}
                  </Field>
                  <Field name="can_register">
                    {({ input, meta }) => (
                      <div className="form-row">
                        <label>Registeration Open:</label>
                        <input className="form-control" {...input} type="checkbox" placeholder="Confirm" />
                        {meta.error && meta.touched && <span>{meta.error}</span>}
                      </div>
                    )}
                  </Field> */}
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
                    <h2>AdminPanel : {url_slug}</h2>
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
                            {this.state.is_open && (
                                <div className="mt-5">
                                    <div className="row">
                                        <div className="col-md-3 font-weight-bold text-center">Name</div>
                                        <div className="col-md-3 font-weight-bold text-center">Price</div>
                                        <div className="col-md-6 font-weight-bold text-center">Status</div>
                                    </div>
                                    {catalogs.map(catalog => (
                                        <div className="row" key={catalog.id}>
                                            <div className="col-md-3 m-1 text-center">{catalog.name}</div>
                                            <div className="col-md-3 m-1 text-center">{catalog.base_price}</div>
                                            <div className="col-md-5  m-1 text-center">
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
                                                        {start && (
                                                            <button
                                                                className="btn btn-danger m-1"
                                                                disabled={start && start !== catalog.id}
                                                                onClick={event => this.markSold(event, catalog.id)}>
                                                                Sold
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
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
