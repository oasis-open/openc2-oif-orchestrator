import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { ConnectedProps, connect } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { Route, Switch } from 'react-router';
import { toast, ToastContainer } from 'react-toastify';
import {
  Breadcrumbs, Error, Home, Nav
} from './components/static';

import {
  Login, Logout, PrivateRoute
} from './components/auth';

import Account from './components/account';
import Device from './components/device';
import Actuator from './components/actuator';
import Command from './components/command';
// import Conformance from './components/conformance';

import { RootState } from './reducers';
import { Util } from './actions';

// Interfaces
interface AppProps {
  history: History;
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  siteTitle: state.Util.site_title
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  info: () => dispatch(Util.info())
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type AppConnectedProps = AppProps & ConnectorProps;

// Component
class App extends Component<AppConnectedProps> {
  constructor(props: AppConnectedProps) {
    super(props);

    const { info } = this.props;
    info();
  }

  render() {
    const { history } = this.props;

    return (
      <div id='contents' className="container-fluid mt-3" >
        <Nav history={ history } />

        <ConnectedRouter history={ history }>
          <div className="row mx-auto">
            <div className="col-12">
              <Breadcrumbs navigate={ (path) => history.push(path) } />

              <Switch>
                <Route path="/:prefix*/login/" component={ Login } />
                <Route path="/:prefix*/logout/" component={ Logout } />
                <PrivateRoute exact path="/" component={ Home } />
                <PrivateRoute path="/account/:page?" component={ Account } />
                <PrivateRoute path="/device/" component={ Device } />
                <PrivateRoute path="/actuator/" component={ Actuator } />
                <PrivateRoute path="/command/:page?/:command?" component={ Command } />
                {/* <PrivateRoute path="/conformance/:page?/:id?" component={ Conformance } /> */}
                {/* This should always be last route */}
                <PrivateRoute component={ Error } />
              </Switch>
            </div>
          </div>
        </ConnectedRouter>

        <ToastContainer position={ toast.POSITION.BOTTOM_CENTER } autoClose={ 5000 } />
      </div>
    );
  }
}

export default connector(App);
