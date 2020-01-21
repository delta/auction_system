import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import Welcome from './Welcome.jsx';
import PageNotFound from './PageNotFound.jsx';
import UserRegistration from './UserRegistration.jsx';
import AdminPanel from './AdminPanel.jsx';
import Home from './Home.jsx';
import Login from './Login.jsx';
import Auction from './Auction.jsx';
import ManageCatalog from './ManageCatalog.jsx';

ReactDOM.render(
    <BrowserRouter>
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
