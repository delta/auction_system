import React, {Component} from 'react';
import dataFetch from './DataFetch';
import {Form, Field} from 'react-final-form';

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
                }
            })
            .catch(err => {
                //Add sweet alert to tell about the error
                alert(err);
            });
    }
    render() {
        return (
            <div className="container" style={style.formBox}>
                <h2>Register :)</h2>
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
                            errors.contact = 'Contact Number Must Be Valid';
                        }
                        if (!values.email) {
                            errors.email = 'Required';
                        } else if (!validateEmail(values.email)) {
                            errors.email = 'Email must be valid';
                        }
                        return errors;
                    }}
                    render={({handleSubmit, form, submitting, pristine, values}) => (
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
                            <Field name="confirm">
                                {({input, meta}) => (
                                    <div className="form-row">
                                        <label>Confirm</label>
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
                                        <input className="form-control" {...input} type="text" placeholder="Email" />
                                        {meta.error && meta.touched && <span>{meta.error}</span>}
                                    </div>
                                )}
                            </Field>
                            <Field name="country">
                                {({input, meta}) => (
                                    <div className="form-row">
                                        <label>Country</label>
                                        <input className="form-control" {...input} type="text" placeholder="Country" />
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
        );
    }
}

export default UserRegistration;
