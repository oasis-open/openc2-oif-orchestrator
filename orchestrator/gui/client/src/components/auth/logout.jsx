import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import * as AuthActions from '../../actions/auth';

class Logout extends Component {
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

Logout.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  isAuthenticated: AuthActions.isAuthenticated(state.Auth)
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(AuthActions.logout())
});

export default connect(mapStateToProps, mapDispatchToProps)(Logout);