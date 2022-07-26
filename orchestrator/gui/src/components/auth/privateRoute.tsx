import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { Redirect, Route, RouteProps } from 'react-router';
import * as AuthActions from '../../actions/auth';
import { RootState } from '../../reducers';

// Interfaces
interface PrivateRouteProps extends RouteProps {
  adminRequired?: boolean;
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  isAdmin: state.Auth.access ? state.Auth.access.admin : false,
  isAuthenticated: AuthActions.isAuthenticated(state.Auth)
});

const connector = connect(mapStateToProps, {});
type ConnectorProps = ConnectedProps<typeof connector>;
type PrivateRouteConnectedProps = PrivateRouteProps & ConnectorProps;

// Component
class PrivateRoute extends Route<PrivateRouteConnectedProps> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    adminRequired: true
  };

  render() {
    const {
      adminRequired, isAdmin, isAuthenticated, location
    } = this.props;

    // TODO: check if auth??
    if (adminRequired && isAdmin) {
      return super.render();
    }
    if (isAuthenticated) {
      return super.render();
    }
    return (
      <Redirect
        to={{
          pathname: '/login',
          state: { from: location }
        }}
      />
    );
  }
}

export default connector(PrivateRoute);
