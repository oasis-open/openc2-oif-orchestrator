import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { ConnectedProps, connect } from 'react-redux';
import { Redirect } from 'react-router';

import * as AuthActions from '../../actions/auth';
import { RootState } from '../../reducers';

// Interfaces
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface LogoutProps {}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  isAuthenticated: AuthActions.isAuthenticated(state.Auth)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  logout: () => dispatch(AuthActions.logout())
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type LogoutConnectedProps = LogoutProps & ConnectorProps;

// Component
class Logout extends Component<LogoutConnectedProps> {
  componentDidMount() {
    const { isAuthenticated, logout } = this.props;
    if (isAuthenticated) {
      logout();
    }
  }

  render() {
    return (
      <Redirect to='/' />
    );
  }
}

export default connector(Logout);