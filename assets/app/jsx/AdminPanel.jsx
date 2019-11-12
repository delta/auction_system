import React, {Component} from 'react';
import dataFetch from './DataFetch';
import {Form, Field} from 'react-final-form';
import io from 'socket.io-client';

const style = {
    formBox: {
        width: '300px',
        height: '600px',
        position: 'absolute',
        left: '50%',
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
            clientIds: []
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.openAuction = this.openAuction.bind(this);
        this.closeAuction = this.closeAuction.bind(this);
    }

    componentWillMount() {
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
            dataFetch('/auctionConfig', data)
                .then(response => {
                    if (response.status_code == 200 && response.message != null) {
                        let data = response.message;
                        //update state values;
                        this.setState({
                            owner_id: user.user_id,
                            q_type: 'update_config',
                            can_register: data.can_register == 1 ? true : false,
                            is_open: data.is_open == 1 ? true : false,
                            url_slug: data.auction_url,
                            max_users: data.max_users
                        });
                    } else {
                        this.setState({
                            owner_id: user.user_id,
                            q_type: 'add_config'
                        });
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }

    onSubmit(values) {
        let data = {...values};
        data.q_type = this.state.q_type;
        data.user_id = this.state.owner_id;
        dataFetch('/auctionConfig', data)
            .then(response => {
                this.setState({
                    q_type: 'update_config',
                    can_register: values.can_register == 1 ? true : false,
                    is_open: values.is_open == 1 ? true : false,
                    url_slug: values.url_slug,
                    max_users: values.max_users
                });
            })
            .catch(err => {
                console.log(err);
            });
    }

    openAuction() {
        //update auctionConfig
        let data = {...this.state};
        data.is_open = true;
        dataFetch('/auctionConfig', data)
            .then(response => {
                if (response.status_code == 200) {
                    this.setState({
                        is_open: true
                    });
                } else {
                    console.log('Error in opening auction');
                }
            })
            .catch(err => {
                console.log('Some error occured');
            });

        socket = io.connect();
        socket.on('connect', () => {
            //once connected to server request to openAuction
            socket.emit('openAuction', this.state.url_slug, this.state.owner_id);
        });
        socket.on('success', message => {
            console.log(message);
        });
        socket.on('onlineUsers', message => {
            this.setState({
                clientIds: message
            });
        });
    }

    closeAuction() {
        //update auctionConfig
        let data = {...this.state};
        data.is_open = false;
        dataFetch('/auctionConfig', data)
            .then(response => {
                if (response.status_code == 200) {
                    this.setState({
                        is_open: false,
                        clientIds: []
                    });
                } else {
                    console.log('Error in closing auction');
                }
            })
            .catch(err => {
                console.log('Some error occured');
            });

        //emit close auction
        socket.emit('closeAuction', this.state.url_slug, this.state.owner_id);
    }

    render() {
        if (this.state.q_type == 'add_config') {
            return (
                <div>
                    <div className="container" style={style.formBox}>
                        <h2>AdminPanel :)</h2>
                        <Form
                            onSubmit={this.onSubmit}
                            initialValues={{
                                url_slug: this.state.url_slug,
                                max_users: this.state.max_users,
                                is_open: this.state.is_open,
                                can_register: this.state.can_register
                            }}
                            validate={values => {
                                const errors = {};
                                if (!values.url_slug) {
                                    errors.url_slug = 'Required';
                                }
                                if (!values.max_users) {
                                    errors.max_users = 'Required';
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
                                            {this.state.q_type == 'add_config' ? 'Add' : 'Update'}
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
                    <h2>AdminPanel : {this.state.url_slug}</h2>
                    <h3>
                        UsersCount: {this.state.clientIds.length}/{this.state.max_users}
                    </h3>
                    <h6>ActiveUsers:</h6>
                    <p>{this.state.clientIds.join(',')}</p>
                    <button className="btn btn-primary" onClick={this.openAuction} disabled={this.state.is_open}>
                        Open Auction
                    </button>
                    <button className="btn btn-danger" onClick={this.closeAuction} disabled={!this.state.is_open}>
                        Close Auction
                    </button>
                </div>
            );
        }
    }
}

export default AdminPanel;
