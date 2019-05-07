import React from 'react'
import { connect } from 'react-redux'

import {
  Redirect,
  Route
} from 'react-router-dom'

import * as AuthActions from '../../actions/auth'

class PrivateRoute extends Route {
    render() {
        return (
            this.props.isAuthenticated ?
                super.render()
            :
                <Redirect
                    to={{
                        pathname: 'login',
                        state: { from: this.props.location }
                    }}
                />
        )
    }
}

function mapStateToProps(state) {
    return {
        authErrors: state.Auth.errors,
        isAuthenticated: AuthActions.isAuthenticated(state.Auth)
    }
}

export default connect(mapStateToProps)(PrivateRoute)
