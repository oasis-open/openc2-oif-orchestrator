import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Jumbotron } from 'reactstrap';

import { InputField } from '../utils';
import * as AuthActions from '../../actions/auth';

class Login extends Component {
  constructor(props, context) {
    super(props, context);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.errPopup = null;

    this.state = {
      username: '',
      password: ''
    };
  }

  onSubmit(e) {
    e.preventDefault();
    const { onSubmit } = this.props;
    const { password, username } = this.state;
    onSubmit(username, password);
  }

  handleInputChange(e) {
    const {
      checked, name, type, value
    } = e.target;
    const eVal = type === 'checkbox' ? checked : value;

    this.setState({
      [name]: eVal
    });
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
          onClose: () => { this.errPopup = null; }
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

Login.propTypes = {
  authErrors: PropTypes.object,
  isAuthenticated: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
    hash: PropTypes.string,
    state: PropTypes.object,
    key: PropTypes.string
  }).isRequired
};

Login.defaultProps = {
  authErrors: {}
};

const mapStateToProps = (state) => ({
  authErrors: state.Auth.errors,
  isAuthenticated: AuthActions.isAuthenticated(state.Auth)
});

const mapDispatchToProps = (dispatch) => ({
  onSubmit: (username, password) => dispatch(AuthActions.login(username, password))
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);