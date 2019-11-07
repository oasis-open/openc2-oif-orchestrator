import React from 'react'
import { connect } from 'react-redux'

import {
 Redirect,
 Route
} from 'react-router-dom'

import * as AuthActions from '../../actions/auth'

class PrivateRoute extends Route {
  render() {
    if (this.props.adminRequired && this.props.isAdmin) {
      return super.render()
    } else if (this.props.isAuthenticated) {
      return super.render()
    } else {
      return (
        <Redirect
          to={{
            pathname: '/login',
            state: { from: this.props.location }
          }}
        />
      )
    }
  }
}

const mapStateToProps = (state) => ({
  authErrors: state.Auth.errors,
  isAdmin: state.Auth.access ? state.Auth.access.admin : false,
  isAuthenticated: AuthActions.isAuthenticated(state.Auth)
})

export default connect(mapStateToProps)(PrivateRoute)
