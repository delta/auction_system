import React, {Component} from 'react';
import dataFetch from './DataFetch';
import {Form, Field} from 'react-final-form';
import {notifyError} from '../Common/common';

const style = {
    formBox: {
        background: 'white',
        width: '340px',
        height: '650px',
        position: 'absolute',
        left: '50%',
        top: '55%',
        margin: '-300px 0 0 -150px',
        fontSize: '15px',
        fontFamily: 'Times New Roman',
        paddingTop: '15px',
        paddingLeft: '20px',
        paddingRight: '20px',
        paddingBottom: '15px'
    },
    top: {
        background: '#8bcdcd',
        width: '100%',
        height: '800px'
    },
    navbar: {
        background: 'white',
        width: '100%',
        padding: '10px'
    },
    heading: {
        fontFamily: 'Georgia',
        paddingLeft: '30px'
    }
};
const validateEmail = email => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

const validateContact = number => {
    var mobile = /^([+]\d{2})?\d{10}$/;
    return mobile.test(number);
};

class UserRegistration extends Component {
    onSubmit(values) {
        dataFetch('/userRegisteration', values)
            .then(response => {
                if (response.status_code == 200) {
                    window.location.href = '/login';
                } else {
                    notifyError(response.message);
                }
            })
            .catch(err => {
                //Add sweet alert to tell about the error
                alert(err);
            });
    }
    render() {
        return (
            <div style={style.top}>
                <div style={style.navbar}>
                    <h2 style={style.heading}> JOIN AUCTION </h2>
                </div>
                <div className="container" style={style.formBox}>
                    <h1>Create Account</h1>
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
                            if (!values.confirm) {
                                errors.confirm = 'Required';
                            } else if (values.confirm !== values.password) {
                                errors.confirm = 'Must match';
                            }
                            if (!values.country) {
                                errors.country = 'Required';
                            }
                            if (!values.contact) {
                                errors.contact = 'Required';
                            } else if (!validateContact(values.contact)) {
                                errors.contact = 'Enter a valid contact number';
                            }
                            if (!values.email) {
                                errors.email = 'Required';
                            } else if (!validateEmail(values.email)) {
                                errors.email = 'Enter a valid email';
                            }
                            return errors;
                        }}
                        render={({handleSubmit, form, submitting, pristine, values}) => (
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
                                <Field name="confirm">
                                    {({input, meta}) => (
                                        <div className="form-row">
                                            <label>Re-enter password</label>
                                            <input
                                                className="form-control"
                                                {...input}
                                                type="password"
                                                placeholder="Confirm"
                                            />
                                            {meta.error && meta.touched && <span>{meta.error}</span>}
                                        </div>
                                    )}
                                </Field>
                                <Field name="email">
                                    {({input, meta}) => (
                                        <div className="form-row">
                                            <label>Email</label>
                                            <input
                                                className="form-control"
                                                {...input}
                                                type="text"
                                                placeholder="Email"
                                            />
                                            {meta.error && meta.touched && <span>{meta.error}</span>}
                                        </div>
                                    )}
                                </Field>
                                <Field name="country">
                                    {({input, meta}) => (
                                        <div className="form-row">
                                            <label>Country</label>
                                            <input
                                                className="form-control"
                                                {...input}
                                                type="text"
                                                placeholder="Country"
                                            />
                                            {meta.error && meta.touched && <span>{meta.error}</span>}
                                        </div>
                                    )}
                                </Field>
                                <Field name="contact">
                                    {({input, meta}) => (
                                        <div className="form-row">
                                            <label>Contact</label>
                                            <input
                                                className="form-control"
                                                {...input}
                                                type="number"
                                                placeholder="Contact"
                                            />
                                            {meta.error && meta.touched && <span>{meta.error}</span>}
                                        </div>
                                    )}
                                </Field>
                                <div className="form-row actionButton">
                                    <button className="btn btn-primary" type="submit" disabled={submitting}>
                                        Submit
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        type="button"
                                        onClick={form.reset}
                                        disabled={submitting || pristine}>
                                        Reset
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

export default UserRegistration;
