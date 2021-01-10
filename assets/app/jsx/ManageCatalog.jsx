import React, {Component} from 'react';
import dataFetch from './DataFetch';
import {notifySuccess, notifyError} from '../Common/common';
import {Form, Field} from 'react-final-form';

class Filter extends Component{
  render()
  {
    return(
       <div >
       <img/>
       <input type='text' placeholder= 'search catalog here' onKeyDown={event =>this.props.onTextChange(event.target.value)}/>
       </div>
    );
  }
}
class ManageCatalog extends Component {
    state = {
        selectedCatalog: {},
        updateType: '',
        filterString: ''
    };
    deleteCatalog = id => {
        let data = {id: id};
        data.isAuthRequired = true;
        dataFetch('/deleteCatalog', data)
            .then(response => {
                if (response.status_code == 200) {
                    notifySuccess('Successfully Deleted');
                    this.getCatalog();
                    this.props.updateCatalog({owner_id: this.props.owner_id});
                } else {
                    notifyError('' + response.message);
                }
            })
            .catch(err => {
                notifyError('' + err.message);
            });
    };
    componentDidMount() {
        this.getCatalog();
    }
    getCatalog = () => {
        const data = {
            owner_id: this.props.owner_id
        };
        data.isAuthRequired = true;
        dataFetch('/getCatalog', data)
            .then(response => {
                if (response.status_code == 200) {
                    this.setState({
                        catalogs: response.message
                    });
                } else {
                    notifyError('' + response.message);
                }
            })
            .catch(err => {
                notifyError('' + err.response);
            });
    };
    submitUpdateCatalog = values => {
        const {updateType, selectedCatalog} = this.state;
        const data = {
            owner_id: this.props.owner_id,
            name: values.name,
            base_price: values.base_price,
            quantity: values.quantity,
            for_sale: values.for_sale || true,
            description: values.description || '',
            thumbnail_url: values.thumbnail_url || ''
        };
        data.isAuthRequired = true;
        if (updateType === 'update') {
            data.id = selectedCatalog.id;
            dataFetch('/updateCatalog', data)
                .then(response => {
                    if (response.status_code == 200) {
                        notifySuccess('Successfully Updated');
                        this.setState(
                            {
                                updateType: ''
                            },
                            () => {
                                this.getCatalog();
                                this.props.updateCatalog({owner_id: this.props.owner_id});
                            }
                        );
                    } else {
                        notifyError(response.message);
                    }
                })
                .catch(err => {
                    notifyError('' + err.message);
                });
        } else {
            dataFetch('/createCatalog', data)
                .then(response => {
                    if (response.status_code == '200') {
                        notifySuccess('Successfully Created catalog');
                        this.setState(
                            {
                                updateType: ''
                            },
                            () => {
                                this.getCatalog();
                                this.props.updateCatalog({owner_id: this.props.owner_id});
                            }
                        );
                    } else {
                        notifyError('' + response.message);
                    }
                })
                .catch(err => {
                    notifyError('' + err.message);
                });
        }
    };
    updateCatalog = catalog => {
        this.setState({
            selectedCatalog: catalog,
            updateType: 'update'
        });
    };
    addCatalog = () => {
        const data = {
            name: '',
            base_price: 0,
            quantity: 0,
            for_sale: true,
            description: '',
            thumbnail_url: ''
        };
        this.setState({
            updateType: 'create',
            selectedCatalog: data
        });
    };
    render() {
        const {name, quantity, base_price, for_sale, description, thumbnail_url} = this.state.selectedCatalog;
        const {updateType, catalogs} = this.state;
        const {catalogId} = this.props;
        return (
            <div className="">
                <div className="row mb-5">
                    <div className="col-md-12 d-flex justify-content-end">
                    <div  className ="col-md-6">
                    <Filter onTextChange={
                      text=> this.setState({filterString : text})
                    }/>
                    </div>
                        <button className="createNew btn btn-primary" onClick={this.addCatalog}>
                            Add Catalog
                        </button>
                    </div>
                </div>
                {updateType === '' ? (
                    <>
                        {' '}
                        <div className="row">
                            <div className="col-md-3 font-weight-bold text-center">Name</div>
                            <div className="col-md-3 font-weight-bold text-center">Price</div>
                            <div className="col-md-6 font-weight-bold text-center">Status</div>
                        </div>
                        {catalogs &&
                            catalogs
                            .filter(
                            Catalog =>{

                              if(this.state.filterString != undefined){
                             return  Catalog.name.includes(
                                  this.state.filterString)
                                } else {
                                  return true
                                }

                            }
                            ).map(catalog => (
                                <div className="row" key={catalog.id}>
                                    <div className="col-md-3 m-1 text-center">{catalog.name}</div>
                                    <div className="col-md-3 m-1 text-center">{catalog.base_price}</div>
                                    <div className="col-md-5  m-1 text-center">
                                        <div>
                                            <button
                                                className={'btn btn-success m-1'}
                                                disabled={catalog.id === catalogId ? true : false}
                                                onClick={() => this.deleteCatalog(catalog.id)}>
                                                Delete
                                            </button>
                                            <button
                                                className={'btn btn-danger m-1'}
                                                disabled={catalog.id === catalogId ? true : false}
                                                onClick={event => this.updateCatalog(catalog)}>
                                                Update
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </>
                ) : (
                    <>
                        <div className="row">
                            <div className="col-md-12">
                                <Form
                                    onSubmit={this.submitUpdateCatalog}
                                    initialValues={{
                                        name,
                                        quantity,
                                        base_price,
                                        for_sale,
                                        description,
                                        thumbnail_url
                                    }}
                                    validate={values => {
                                        const errors = {};
                                        if (!values.name) {
                                            errors.name = 'Required';
                                        }
                                        if (!values.quantity) {
                                            errors.quantity = 'Required';
                                        }
                                        if (!values.base_price) {
                                            errors.base_price = 'Required';
                                        }
                                        return errors;
                                    }}
                                    render={({handleSubmit, form, submitting, values}) => (
                                        <form onSubmit={handleSubmit}>
                                            <Field name="name">
                                                {({input, meta}) => (
                                                    <div className="form-row">
                                                        <label>Name</label>
                                                        <input
                                                            className="form-control"
                                                            {...input}
                                                            type="text"
                                                            placeholder="name"
                                                        />
                                                        {meta.error && meta.touched && <span>{meta.error}</span>}
                                                    </div>
                                                )}
                                            </Field>
                                            <Field name="base_price">
                                                {({input, meta}) => (
                                                    <div className="form-row">
                                                        <label>Base Price</label>
                                                        <input
                                                            className="form-control"
                                                            {...input}
                                                            type="number"
                                                            placeholder="Base Price"
                                                        />
                                                        {meta.error && meta.touched && <span>{meta.error}</span>}
                                                    </div>
                                                )}
                                            </Field>
                                            <Field name="quantity">
                                                {({input, meta}) => (
                                                    <div className="form-row">
                                                        <label>Quantity</label>
                                                        <input
                                                            className="form-control"
                                                            {...input}
                                                            type="number"
                                                            placeholder="Quantity"
                                                        />
                                                        {meta.error && meta.touched && <span>{meta.error}</span>}
                                                    </div>
                                                )}
                                            </Field>
                                            <div>
                                                <div className="">For Sale</div>
                                                <Field
                                                    name="for_sale"
                                                    className="form-row form-control"
                                                    component="select">
                                                    <option value="true">True</option>
                                                    <option value="false">False</option>
                                                </Field>
                                            </div>
                                            <Field name="description">
                                                {({input, meta}) => (
                                                    <div className="form-row">
                                                        <label>Description</label>
                                                        <input
                                                            className="form-control"
                                                            {...input}
                                                            type="text"
                                                            placeholder="Description"
                                                        />
                                                        {meta.error && meta.touched && <span>{meta.error}</span>}
                                                    </div>
                                                )}
                                            </Field>
                                            <Field name="thumbnail_url">
                                                {({input, meta}) => (
                                                    <div className="form-row">
                                                        <label>Thumbnail Url</label>
                                                        <input
                                                            className="form-control"
                                                            {...input}
                                                            type="text"
                                                            placeholder="Thumbnail Url"
                                                        />
                                                        {meta.error && meta.touched && <span>{meta.error}</span>}
                                                    </div>
                                                )}
                                            </Field>
                                            <div className="form-row d-flex justify-content-center">
                                                <button className="btn btn-success mr-5" type="submit">
                                                    {updateType === 'create'
                                                        ? 'Add'
                                                        : updateType === 'update'
                                                        ? 'Update'
                                                        : ''}
                                                </button>
                                                <button
                                                    className="btn btn-danger"
                                                    type="submit"
                                                    onClick={() => this.setState({updateType: ''})}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }
}

export {Filter,ManageCatalog};
