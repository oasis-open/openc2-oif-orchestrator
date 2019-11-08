import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import qs from 'query-string'
import { toast } from 'react-toastify'

import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader
} from 'reactstrap'

import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'

import * as AccountActions from '../../../actions/account'
import { withGUIAuth } from '../../../actions/util'

const str_fmt = require('string-format')

class ChangePassword extends Component {
  constructor(props, context) {
    super(props, context)

    this.submitForm = this.submitForm.bind(this)

    this.meta = {
      title: str_fmt('{base} | {page}', {base: this.props.siteTitle, page: 'Account - Change Password'}),
      canonical: str_fmt('{origin}{path}', {origin: window.location.origin, path: window.location.pathname})
    }

    this.state = {
      password: {
        old: '',
        new_1: '',
        new_2: ''
      },
      errors: {},
      status: ''
    }
  }

  submitForm(e) {
    e.preventDefault()
    Promise.resolve(this.props.changePassword(this.props.username, ...Object.values(this.state.password))).then(rsp => {
      this.setState({
        errors: this.props.errors[AccountActions.CHANGE_ACCOUNT_PASSWORD_FAILURE],
        status: this.props.status[AccountActions.CHANGE_ACCOUNT_PASSWORD_SUCCESS]
      })
    })
  }

  render() {
    return (
      <div className='jumbotron col-md-6 mx-auto'>
        <Helmet>
          <title>{ this.meta.title }</title>
          <link rel="canonical" href={ this.meta.canonical } />
        </Helmet>
        <h1 className='text-center'>Password Change</h1>

        <form className='col-md-10 mx-auto' onSubmit={ this.submitForm }>
          {
            this.state.status ? (
              <p className="form-text text-info">{ this.state.status }</p>
            ) : ''
          }
          <div className='form-group'>
            <label htmlFor='old_password'>Old Password</label>
            <input
              type='password'
              className='form-control'
              id='old_password'
              required=''
              placeholder='password'
              value={ atob(this.state.password.old) }
              onChange={ e => this.setState({ password: { ...this.state.password, old: btoa(e.target.value) } }) }
            />
            {
              this.state.errors.old_password ? (
                <small className="form-text text-danger">{ this.state.errors.old_password }</small>
              ) : ''
            }
          </div>
          <div className='form-group'>
            <label htmlFor='new_password_1'>New Password</label>
            <input
              type='password'
              className='form-control'
              id='new_password_1'
              required=''
              placeholder='password'
              value={ atob(this.state.password.new_1) }
              onChange={ e => this.setState({ password: { ...this.state.password, new_1: btoa(e.target.value) } }) }/>
            {
              this.state.errors.new_password_1 ? (
                <small className="form-text text-danger">{ this.state.errors.new_password_1 }</small>
              ) : ''
            }
          </div>
          <div className='form-group'>
            <label htmlFor='new_password_2'>New Password Confirmation</label>
            <input
              type='password'
              className='form-control'
              id='new_password_2'
              required=''
              placeholder='password'
              value={ atob(this.state.password.new_2) }
              onChange={ e => this.setState({ password: { ...this.state.password, new_2: btoa(e.target.value) } }) }/>
            {
              this.state.errors.new_password_2 ? (
                <small className="form-text text-danger">{ this.state.errors.new_password_2 }</small>
              ) : ''
            }
          </div>

          <small className='form-text text-muted'>
            <ul>
              <li>Your password can't be too similar to your other personal information.</li>
              <li>Your password must contain at least 8 characters.</li>
              <li>Your password can't be a commonly used password.</li>
              <li>Your password can't be entirely numeric.</li>
            </ul>
          </small>

          <Button type='submit' color='primary' className="float-right">Save changes</Button>
        </form>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  username: state.Auth.access == undefined ? 'User' : state.Auth.access.username,
  errors: state.Account.errors,
  status: state.Account.status,
  siteTitle: state.Util.site_title
})

const mapDispatchToProps = (dispatch) => ({
  changePassword: (usrn, op, np1, np2) => dispatch(AccountActions.changeAccountPassword(usrn, op, np1, np2))
})

export default connect(mapStateToProps, mapDispatchToProps)(ChangePassword)
