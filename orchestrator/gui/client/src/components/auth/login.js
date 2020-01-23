import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  Alert,
  Button,
  Form,
  FormGroup,
  FormFeedback,
  Input,
  Jumbotron,
  Label,
} from 'reactstrap'

import { InputField } from '../utils'

import * as AuthActions from '../../actions/auth'

class Login extends Component {
  constructor(props, context) {
    super(props, context)

    this.errPopup = null

    this.state = {
      username: '',
      password: ''
    }
  }

  handleInputChange(event) {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name

    this.setState({
      [name]: value
    });
  }

  onSubmit(event) {
    event.preventDefault()
    this.props.onSubmit(this.state.username, this.state.password)
  }

  render() {
    let { from } = this.props.location.state || { from: { pathname: '/' } }

    if (this.props.isAuthenticated) {
      return (
        <Redirect to={ from } />
      )
    } else {
      const errors = this.props.authErrors || {}
      if (errors.non_field_errors && !this.errPopup) {
        this.errPopup = toast(<p>{ errors.non_field_errors }</p>, {type: toast.TYPE.INFO, onClose: () => { this.errPopup = null }})
      }

      return (
        <Jumbotron className="col-md-4 col-lg-3 mx-auto">
          <Form onSubmit={ this.onSubmit.bind(this) }>
            <h1>Login</h1>

            <InputField
              name="username"
              label="Username"
              error={ errors.username }
              onChange={ this.handleInputChange.bind(this) }
            />

            <InputField
              name="password"
              label="Password"
              error={ errors.password }
              type="password"
              onChange={ this.handleInputChange.bind(this) }
            />

            <div className="float-right btn-group" role="group">
              <Button type="submit" color="primary">Log In</Button>
              <Button type="reset" color="warning">Reset</Button>
            </div>
          </Form>
        </Jumbotron>
      )
    }
  }
}

const mapStateToProps = (state) => ({
  authErrors: state.Auth.errors,
  isAuthenticated: AuthActions.isAuthenticated(state.Auth)
})

const mapDispatchToProps = (dispatch) => ({
  onSubmit: (username, password) => dispatch(AuthActions.login(username, password))
})

export default connect(mapStateToProps, mapDispatchToProps)(Login)