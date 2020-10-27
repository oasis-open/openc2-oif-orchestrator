import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Button, Input, Label } from 'reactstrap';

import { objectValues, safeGet } from '../utils';
import * as AccountActions from '../../actions/account';

class ChangePassword extends Component {
  constructor(props, context) {
    super(props, context);
    this.submitForm = this.submitForm.bind(this);
    this.updatePassword = this.updatePassword.bind(this);

    const { siteTitle } = this.props;
    this.meta = {
      title: `${siteTitle} | Account - Change Password`,
      canonical: `${window.location.origin}${window.location.pathname}`
    };

    this.state = {
      password: {
        old_password: '',
        new_password_1: '',
        new_password_2: ''
      },
      errors: {},
      status: ''
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return {
      ...prevState,
      errors: safeGet(nextProps.errors, AccountActions.CHANGE_ACCOUNT_PASSWORD_FAILURE, {}),
      status: safeGet(nextProps.status, AccountActions.CHANGE_ACCOUNT_PASSWORD_SUCCESS, '')
    };
  }

  submitForm(e) {
    e.preventDefault();

    const { changePassword, username } = this.props;
    const { password } = this.state;
    changePassword(username, ...objectValues(password));
  }

  updatePassword(e) {
    const target = e.currentTarget;
    this.setState(prevState => ({
      password: {
        ...prevState.password,
        [target.id]: btoa(target.value)
      }
    }));
  }

  // eslint-disable-next-line class-methods-use-this
  helpText(txt, type) {
    // eslint-disable-next-line no-param-reassign
    type = type || 'info';
    return txt ? <p className={ `form-text text-${type}` }>{ txt }</p> : '';
  }

  render() {
    const { errors, password, status } = this.state;

    return (
      <div className='jumbotron col-md-6 mx-auto'>
        <Helmet>
          <title>{ this.meta.title }</title>
          <link rel="canonical" href={ this.meta.canonical } />
        </Helmet>
        <h1 className='text-center'>Password Change</h1>

        <form className='col-md-10 mx-auto' onSubmit={ this.submitForm }>
          { this.helpText(status, 'info') }
          <div className='form-group'>
            <Label for='old_password'>Old Password</Label>
            <Input
              id='old_password'
              className='form-control'
              type='password'
              required=''
              placeholder='password'
              value={ atob(password.old_password) }
              onChange={ this.updatePassword }
            />
            { this.helpText(errors.old_password, 'danger') }
          </div>
          <div className='form-group'>
            <Label for='new_password_1'>New Password</Label>
            <Input
              id='new_password_1'
              className='form-control'
              type='password'
              required=''
              placeholder='password'
              value={ atob(password.new_password_1) }
              onChange={ this.updatePassword }
            />
            { this.helpText(errors.new_password_1, 'danger') }
          </div>
          <div className='form-group'>
            <Label for='new_password_2'>New Password Confirmation</Label>
            <Input
              id='new_password_2'
              className='form-control'
              type='password'
              required=''
              placeholder='password'
              value={ atob(password.new_password_2) }
              onChange={ this.updatePassword }
            />
            { this.helpText(errors.new_password_2, 'danger') }
          </div>

          <small className='form-text text-muted'>
            <ul>
              <li>Your password can&apos;t be too similar to your other personal information.</li>
              <li>Your password must contain at least 8 characters.</li>
              <li>Your password can&apos;t be a commonly used password.</li>
              <li>Your password can&apos;t be entirely numeric.</li>
            </ul>
          </small>

          <Button type='submit' color='primary' className="float-right">Save changes</Button>
        </form>
      </div>
    );
  }
}

ChangePassword.propTypes = {
  changePassword: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  siteTitle: PropTypes.string.isRequired,
  status: PropTypes.object.isRequired,
  username: PropTypes.string.isRequired
};

const mapStateToProps = state => ({
  username: state.Auth.access === undefined ? 'User' : state.Auth.access.username,
  errors: state.Account.errors,
  status: state.Account.status,
  siteTitle: state.Util.site_title
});

const mapDispatchToProps = (dispatch) => ({
  changePassword: (usrn, op, np1, np2) => dispatch(AccountActions.changeAccountPassword(usrn, op, np1, np2))
});

export default connect(mapStateToProps, mapDispatchToProps)(ChangePassword);
