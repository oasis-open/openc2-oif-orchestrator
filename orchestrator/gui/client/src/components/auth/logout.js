import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'

import * as AuthActions from '../../actions/auth'

class Logout extends Component {
    componentWillMount() {
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

function mapStateToProps(state) {
    return {
        authErrors: state.Auth.errors,
        isAuthenticated: AuthActions.isAuthenticated(state.Auth)
    }
}

function mapDispatchToProps(dispatch) {
    return {
        logout: () => dispatch(AuthActions.logout())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Logout)