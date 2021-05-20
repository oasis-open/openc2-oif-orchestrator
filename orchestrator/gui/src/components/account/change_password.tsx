import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { ConnectedProps, connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Button, Input, Label } from 'reactstrap';
import { objectValues, safeGet } from '../utils';
import * as AccountActions from '../../actions/account';
import { RootState } from '../../reducers';

// Interfaces
type ChangePasswordProps = Record<string, any>

interface ChangePasswordState {
  password: {
    old_password: string;
    new_password_1: string;
    new_password_2: string;
  },
  errors: Record<string, any>;
  status: string;
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  username: state.Auth.access === undefined ? 'User' : state.Auth.access.username,
  errors: state.Account.errors,
  status: state.Account.status,
  siteTitle: state.Util.site_title
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  changePassword: (usn: string, op: string, np1: string, np2: string) => {
    return dispatch(AccountActions.changeAccountPassword(usn, op, np1, np2));
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type ChangePasswordConnectedProps = ChangePasswordProps & ConnectorProps;

// Component
class ChangePassword extends Component<ChangePasswordConnectedProps, ChangePasswordState> {
  meta: {
    title: string;
    canonical: string;
  }

  constructor(props: ChangePasswordConnectedProps) {
    super(props);
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

  static getDerivedStateFromProps(nextProps: ChangePasswordConnectedProps, prevState: ChangePasswordState) {
    return {
      ...prevState,
      errors: safeGet(nextProps.errors, AccountActions.CHANGE_PASSWORD_FAILURE, {}),
      status: safeGet(nextProps.status, AccountActions.CHANGE_PASSWORD_SUCCESS, '')
    };
  }

  submitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const { changePassword, username } = this.props;
    const { password } = this.state;
    const passwd = objectValues(password) as [string, string, string];
    changePassword(username, ...passwd);
  }

  updatePassword(e: React.ChangeEvent<HTMLInputElement>) {
    const target = e.currentTarget;
    this.setState(prevState => ({
      password: {
        ...prevState.password,
        [target.id]: btoa(target.value)
      }
    }));
  }

  // eslint-disable-next-line class-methods-use-this
  helpText(txt: string, type: string) {
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
              required
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
              required
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
              required
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

export default connector(ChangePassword);
