import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createBrowserHistory } from 'history';
import { connect } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { Route, Switch } from 'react-router';
import { toast, ToastContainer } from 'react-toastify';

import {
  Breadcrumbs,
  Error,
  Home,
  Nav
} from './components/static';

import {
  Login,
  Logout,
  PrivateRoute
} from './components/auth';

import Account from './components/account';
import Device from './components/device';
import Actuator from './components/actuator';
import Command from './components/command';
// import Conformance from './components/conformance';

import * as UtilActions from './actions/util';

class App extends Component {
  constructor(props, context) {
    super(props, context);
    this.props.info();
  }

  render() {
    return (
      <div id='contents' className="container-fluid mt-3" >
        <Nav history={ this.props.history } />

        <ConnectedRouter history={ this.props.history }>
          <div className="row mx-auto">
            <div className="col-12">
              <Breadcrumbs navigate={ (path) => this.props.history.push(path) } />

              <Switch>
                <Route path="/:prefix*/login/" component={ Login } />
                <Route path="/:prefix*/logout/" component={ Logout } />
                <PrivateRoute exact path="/" component={ Home } />
                <PrivateRoute path="/account/:page?" component={ Account } />
                <PrivateRoute path="/device/" component={ Device } />
                <PrivateRoute path="/actuator/" component={ Actuator } />
                <PrivateRoute path="/command/:page?/:command?" component={ Command } />
                {/* <PrivateRoute path="/conformance/:page?/:id?" component={ Conformance } /> */}
                <PrivateRoute component={ Error } /> // This should always be last route
              </Switch>
            </div>
          </div>
        </ConnectedRouter>

        <ToastContainer position={ toast.POSITION.BOTTOM_CENTER } autoClose={ 5000 } />
      </div>
    );
  }
}

App.propTypes = {
  history: PropTypes.objectOf(createBrowserHistory).isRequired,
  info: PropTypes.func.isRequired
};

const mapDispatchToProps = dispatch => ({
  info: () => dispatch(UtilActions.info())
});

export default connect(null, mapDispatchToProps)(App);
