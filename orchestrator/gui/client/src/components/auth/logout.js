import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'

import * as AuthActions from '../../actions/auth'

class Logout extends Component {
  componentDidMount() {
    if (this.props.isAuthenticated) {
      this.props.logout()
    }
  }

  render() {
    return (
      <Redirect to='/' />
    )
  }
}

const mapStateToProps = (state) => ({
  authErrors: state.Auth.errors,
  isAuthenticated: AuthActions.isAuthenticated(state.Auth)
})

const mapDispatchToProps = (dispatch) => ({
  logout: () => dispatch(AuthActions.logout())
})

export default connect(mapStateToProps, mapDispatchToProps)(Logout)