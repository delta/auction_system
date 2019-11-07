import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import Welcome from './Welcome.jsx';
import PageNotFound from './PageNotFound.jsx';

ReactDOM.render(
    <BrowserRouter>
        <Switch>
            <Route exact path="/" component={Welcome} />
            <Route path="*" component={PageNotFound} />
        </Switch>
    </BrowserRouter>,
    document.getElementById('content')
);
