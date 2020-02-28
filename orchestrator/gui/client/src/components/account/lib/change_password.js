import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Button } from 'reactstrap';

import { safeGet } from '../../utils';
import * as AccountActions from '../../../actions/account';

class ChangePassword extends Component {
  constructor(props, context) {
    super(props, context);

    this.submitForm = this.submitForm.bind(this);
    this.updatePassword = this.updatePassword.bind(this);

    this.meta = {
      title: `${this.props.siteTitle} | Account - Change Password`,
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
    this.props.changePassword(this.props.username, ...Object.values(this.state.password));
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
    return (
      <div className='jumbotron col-md-6 mx-auto'>
        <Helmet>
          <title>{ this.meta.title }</title>
          <link rel="canonical" href={ this.meta.canonical } />
        </Helmet>
        <h1 className='text-center'>Password Change</h1>

        <form className='col-md-10 mx-auto' onSubmit={ this.submitForm }>
          { this.helpText(this.state.status, 'info') }
          <div className='form-group'>
            <label htmlFor='old_password'>Old Password</label>
            <input
              id='old_password'
              className='form-control'
              type='password'
              required=''
              placeholder='password'
              value={ atob(this.state.password.old_password) }
              onChange={ this.updatePassword }
            />
            { this.helpText(this.state.errors.old_password, 'danger') }
          </div>
          <div className='form-group'>
            <label htmlFor='new_password_1'>New Password</label>
            <input
              id='new_password_1'
              className='form-control'
              type='password'
              required=''
              placeholder='password'
              value={ atob(this.state.password.new_password_1) }
              onChange={ this.updatePassword }
            />
            { this.helpText(this.state.errors.new_password_1, 'danger') }
          </div>
          <div className='form-group'>
            <label htmlFor='new_password_2'>New Password Confirmation</label>
            <input
              id='new_password_2'
              className='form-control'
              type='password'
              required=''
              placeholder='password'
              value={ atob(this.state.password.new_password_2) }
              onChange={ this.updatePassword }
            />
            { this.helpText(this.state.errors.new_password_2, 'danger') }
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
