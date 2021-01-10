import React, {Component} from 'react';
import dataFetch from './DataFetch';
import {Form, Field} from 'react-final-form';
import {notifyError} from '../Common/common';

const style = {
    formBox: {
        background: 'white',
        width: '400px',
        height: '350px',
        position: 'absolute',
        left: '50%',
        top: '60%',
        margin: '-300px 0 0 -150px',
        paddingTop: '30px',
        paddingLeft: '15px',
        paddingRight: '15px'
    },
    total: {
        background: ' #8bcdcd',
        widht: '800px',
        height: '100%'
    },
    navbar: {
        background: 'white',
        width: '100%',
        padding: '10px'
    },
    heading: {
        fontFamily: 'Miniver, cursive',
        paddingLeft: '50px'
    }
};

class Login extends Component {
    constructor(props) {
        super(props);
    }

    onSubmit(values) {
        dataFetch('/login', values)
            .then(response => {
                if (response.status_code == 200) {
                    sessionStorage.setItem('user', JSON.stringify(response.message));
                    if (response.message.role == 'Admin') {
                        window.location.href = '/adminpanel';
                    } else {
                        window.location.href = '/home';
                    }
                } else {
                    notifyError('' + response.message);
                }
            })
            .catch(err => {
                notifyError('' + err.response);
            });
    }

    render() {
        return (
            <div style={style.total}>
                <div style={style.navbar}>
                    <h2> ALREADY A MEMBER? </h2>
                </div>
                <div className="container" style={style.formBox}>
                    <h1>LOGIN TO ENTER</h1>
                    <Form
                        onSubmit={this.onSubmit}
                        validate={values => {
                            const errors = {};
                            if (!values.username) {
                                errors.username = 'Required';
                            }
                            if (!values.password) {
                                errors.password = 'Required';
                            }
                            return errors;
                        }}
                        render={({handleSubmit, form, submitting, values}) => (
                            <form onSubmit={handleSubmit}>
                                <Field name="username">
                                    {({input, meta}) => (
                                        <div className="form-row">
                                            <label>Username</label>
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
                                <Field name="password">
                                    {({input, meta}) => (
                                        <div className="form-row">
                                            <label>Password</label>
                                            <input
                                                className="form-control"
                                                {...input}
                                                type="password"
                                                placeholder="Password"
                                            />
                                            {meta.error && meta.touched && <span>{meta.error}</span>}
                                        </div>
                                    )}
                                </Field>
                                <div className="from-row">
                                    <button className="btn btn-primary" type="submit" disabled={submitting}>
                                        go to the panel
                                    </button>
                                </div>
                            </form>
                        )}
                    />
                </div>
            </div>
        );
    }
}

export default Login;
