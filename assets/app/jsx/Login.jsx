import React, {Component} from 'react';
import dataFetch from './DataFetch';
import {Form, Field} from 'react-final-form';
import {notifyError} from '../Common/common';

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
                }
            })
            .catch(err => {
                notifyError('' + err.response);
            });
    }

    render() {
        return (
            <div className="container" style={style.formBox}>
                <h2>Login :)</h2>
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
                                        <input className="form-control" {...input} type="text" placeholder="Username" />
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
                                    Submit
                                </button>
                            </div>
                        </form>
                    )}
                />
            </div>
        );
    }
}

export default Login;
