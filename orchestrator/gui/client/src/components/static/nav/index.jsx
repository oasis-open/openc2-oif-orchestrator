import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createBrowserHistory } from 'history';
import {
  UncontrolledDropdown, DropdownItem, DropdownToggle, DropdownMenu
} from 'reactstrap';
import { ThemeChooser } from 'react-bootswatch-theme-switcher';

import NavItem from './navItem';
import * as AuthActions from '../../../actions/auth';

const themeOptionStyles = {
  position: 'fixed',
  bottom: '5px',
  right: '5px'
};

class DoubleNav extends Component {
  constructor(props, context) {
    super(props, context);
    this.navigate = this.navigate.bind(this);
    this.setSize = this.setSize.bind(this);

    this.topNav = null;
    this.bottomNav = null;

    const { history } = this.props;

    const act = history.location.pathname === this.prefix;
    this.state = {
      active: act ? '/' : history.location.pathname
    };
  }

  setSize() {
    setTimeout(() => {
      if (!this.topNav || !this.bottomNav) { return; }
      const topHeight = this.topNav.getBoundingClientRect().height;
      const bottomHeight = this.bottomNav.getBoundingClientRect().height;

      this.bottomNav.style.marginTop = `${topHeight}px`;
      document.body.style.paddingTop = `${topHeight + bottomHeight + 10}px`;
    }, 30);
  }

  navigate(e) {
    e.preventDefault();
    const { history } = this.props;
    const { href } = e.target;
    if (href === null || href === undefined ) { return; }
    const active = href.replace(window.location.origin, '');

    history.push({ pathname: active });
    this.setState({ active });
  }

  NavTop() {
    const { siteTitle } = this.props;
    return (
      <nav className="navbar navbar-light bg-light border-0 fixed-top" ref={ elm => { this.topNav = elm; } } >
        <div className="container-fluid">
          <a href="/" className="navbar-brand" onClick={ this.navigate }>{ siteTitle }</a>
          <div className="float-right m-0 p-0">
            <p className="navbar-text m-0 p-0">OpenC2 Orchestrator</p>
            <br />
            <p className="navbar-text m-0 p-0">GUI Prototype</p>
          </div>
        </div>
      </nav>
    );
  }

  NavBottom() {
    const { admin, username } = this.props;
    const { active } = this.state;

    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top" ref={ elm => { this.bottomNav = elm; } }>
        <div className="container-fluid">
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navMain"
            aria-controls="navMain"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navMain">
            <ul className="nav navbar-nav mr-auto">
              <NavItem href="/" text="Home" active={ active } click={ this.navigate } />
              <NavItem href="/device" text="Devices" active={ active } click={ this.navigate } />
              <NavItem href="/actuator" text="Actuators" active={ active } click={ this.navigate } />

              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  Command
                </DropdownToggle>
                <DropdownMenu>
                  <NavItem dropdown href="/command/generate" text="Command Generator" active={ active } click={ this.navigate } />
                  <NavItem dropdown href="/command" text="Previous Commands" active={ active } click={ this.navigate } />
                </DropdownMenu>
              </UncontrolledDropdown>

              {/* <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  Conformance
                </DropdownToggle>
                <DropdownMenu>
                  <NavItem dropdown href="/conformance/test" text="New Test" active={ active } click={ this.navigate } />
                  <NavItem dropdown href="/conformance" text="Test Results" active={ active } click={ this.navigate } />
                  <NavItem dropdown href="/conformance/unittests" text="Unittests" active={ active } click={ this.navigate } />
                </DropdownMenu>
              </UncontrolledDropdown> */}
            </ul>
            <ul className="nav navbar-nav pull-right-md ml-md-auto">
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>{ `Hello, ${username}` }</DropdownToggle>
                <DropdownMenu right>
                  { admin ? <NavItem dropdown external href="/admin" text="Admin" target="_blank" active={ active } /> : '' }
                  <NavItem dropdown href="/account/change_password/" text="Change Password" active={ active } click={ this.navigate } />
                  <DropdownItem divider />
                  <NavItem dropdown href="/logout" text="Logout" active={ active } click={ this.navigate } />
                </DropdownMenu>
              </UncontrolledDropdown>
            </ul>
          </div>
        </div>
      </nav>
    );
  }

  render() {
    const { isAuthenticated } = this.props;
    if (isAuthenticated) {
      this.setSize();
      return (
        <div className="navbar-double fixed-top">
          { this.NavTop() }
          { this.NavBottom() }
          <div style={ themeOptionStyles }>
            <ThemeChooser size='sm' change={ this.setSize } />
          </div>
        </div>
      );
    }
    return <div />;
  }
}

DoubleNav.propTypes = {
  admin: PropTypes.bool.isRequired,
  history: PropTypes.objectOf(createBrowserHistory).isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  siteTitle: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired
};

const mapStateToProps = state => ({
  errors: state.Auth.errors,
  isAuthenticated: AuthActions.isAuthenticated(state.Auth),
  username: state.Auth.access === undefined ? 'User' : state.Auth.access.username,
  admin: state.Auth.access ? state.Auth.access.admin : false,
  siteTitle: state.Util.site_title
});

export default connect(mapStateToProps)(DoubleNav);
