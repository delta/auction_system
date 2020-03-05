import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import Welcome from './Welcome.jsx';
import PageNotFound from './PageNotFound.jsx';
import UserRegistration from './UserRegistration.jsx';
import AdminPanel from './AdminPanel/AdminPanel.jsx';
import Home from './Home.jsx';
import Login from './Login.jsx';
import Auction from './Auction.jsx';
import ManageCatalog from './ManageCatalog.jsx';
import {ToastContainer} from 'react-toastify';

ReactDOM.render(
    <BrowserRouter>
        <ToastContainer
            position="top-right"
            hideProgressBar={false}
            autoClose={3000}
            newestOnTop={true}
            closeOnClick={true}
            draggable={false}
            rtl={false}
        />
        <Switch>
            <Route exact path="/" component={Welcome} />
            <Route exact path="/register" component={UserRegistration} />
            <Route exact path="/adminpanel" component={AdminPanel} />
            <Route exact path="/home" component={Home} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/auction/:url_slug/:id" component={Auction} />
            <Route exact path="/manage-catalog" component={ManageCatalog} />
            <Route path="*" component={PageNotFound} />
        </Switch>
    </BrowserRouter>,
    document.getElementById('content')
);
