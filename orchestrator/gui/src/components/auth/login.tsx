import React, { Component, ReactText } from 'react';
import { Dispatch } from 'redux';
import { ConnectedProps, connect } from 'react-redux';
import { Location } from 'history';
import { Redirect } from 'react-router';
import { toast } from 'react-toastify';
import { Button, Form, Jumbotron } from 'reactstrap';

import { InputField } from '../utils';
import * as AuthActions from '../../actions/auth';
import { RootState } from '../../reducers';


// Interfaces
interface LoginProps {
  location: Location
}

interface LoginConnectedState {
  username: string;
  password: string;
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  authErrors: state.Auth.errors || {},
  isAuthenticated: AuthActions.isAuthenticated(state.Auth)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onSubmit: (username: string, password: string) => dispatch(AuthActions.login(username, password))
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type LoginConnectedProps = LoginProps & ConnectorProps;

// Component
class Login extends Component<LoginConnectedProps, LoginConnectedState> {
  errPopup?: ReactText;

  constructor(props: LoginConnectedProps) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      username: '',
      password: ''
    };
  }

  onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { onSubmit } = this.props;
    const { password, username } = this.state;
    onSubmit(username, password);
  }

  handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    if (name === 'username') {
      this.setState({ username: value });
    } else if (name === 'password') {
      this.setState({ password: value });
    }
  }

  render() {
    const { authErrors, isAuthenticated, location } = this.props;
    const { from } = location.state || { from: { pathname: '/' } };

    if (isAuthenticated) {
      return <Redirect to={ from } />;
    }
    const errors = authErrors || {};
    if (errors.non_field_errors && !this.errPopup) {
      this.errPopup = toast(
        <p>{ errors.non_field_errors }</p>,
        {
          type: toast.TYPE.INFO,
          onClose: () => { this.errPopup = undefined; }
        }
      );
    }

    return (
      <Jumbotron className="col-md-4 col-lg-3 mx-auto">
        <Form onSubmit={ this.onSubmit }>
          <h1>Login</h1>

          <InputField
            name="username"
            label="Username"
            error={ errors.username }
            onChange={ this.handleInputChange }
          />

          <InputField
            name="password"
            label="Password"
            error={ errors.password }
            type="password"
            onChange={ this.handleInputChange }
          />

          <div className="float-right btn-group" role="group">
            <Button type="submit" color="primary">Log In</Button>
            <Button type="reset" color="warning">Reset</Button>
          </div>
        </Form>
      </Jumbotron>
    );
  }
}

export default connector(Login);