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

class UserRegistration extends Component {
    constructor(props) {
        super(props);
    }

    onSubmit(values) {
        dataFetch('/userRegisteration', values)
            .then(response => {
                if (response.status_code == 200) {
                    window.location.href = '/login';
                }
            })
            .catch(err => {
                console.log(err);
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
                            <div className="from-row">
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
