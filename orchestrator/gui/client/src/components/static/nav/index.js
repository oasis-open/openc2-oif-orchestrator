import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createBrowserHistory } from 'history';
import {
  UncontrolledDropdown,
  DropdownItem,
  DropdownToggle,
  DropdownMenu
} from 'reactstrap';

import NavItem from './navItem';
import { ThemeChooser } from '../../utils';
import * as AuthActions from '../../../actions/auth';

class DoubleNav extends Component {
  constructor(props, context) {
    super(props, context);
    this.navigate = this.navigate.bind(this);
    this.setSize = this.setSize.bind(this);

    this.topNav = null;
    this.bottomNav = null;

    this.themeOptionStyles = {
      position: 'fixed',
      bottom: '5px',
      right: '5px'
    };

    const act = this.props.history.location.pathname === this.prefix;
    this.state = {
      active: act ? '/' : this.props.history.location.pathname
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
    if (e.target.href === null || e.target.href === undefined ) { return; }
    const href = e.target.href.replace(window.location.origin, '');

    this.props.history.push({ pathname: href });
    this.setState({ active: href });
  }

  NavTop() {
    return (
      <nav className="navbar navbar-light bg-light border-0 fixed-top" ref={ elm => { this.topNav = elm; }} >
        <div className="container-fluid">
          <a href="/" className="navbar-brand" onClick={ this.navigate }>{ this.props.siteTitle }</a>
          <p className="navbar-text float-right m-0 p-0">OpenC2 Orchestrator<br/>GUI Prototype</p>
        </div>
      </nav>
    );
  }

  NavBottom() {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top" ref={ elm => { this.bottomNav = elm; }}>
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
              <NavItem href="/" text="Home" active={ this.state.active } click={ this.navigate }/>
              <NavItem href="/device" text="Devices" active={ this.state.active } click={ this.navigate } />
              <NavItem href="/actuator" text="Actuators" active={ this.state.active } click={ this.navigate } />

              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  Command
                </DropdownToggle>
                <DropdownMenu>
                  <NavItem dropdown href="/command" text="Commands" active={ this.state.active } click={ this.navigate } />
                  <NavItem dropdown href="/command/generate" text="Command Generator" active={ this.state.active } click={ this.navigate } />
                </DropdownMenu>
              </UncontrolledDropdown>

              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  Conformance
                </DropdownToggle>
                <DropdownMenu>
                  <NavItem dropdown href="/conformance/test" text="New Test" active={ this.state.active } click={ this.navigate } />
                  <NavItem dropdown href="/conformance" text="Test Results" active={ this.state.active } click={ this.navigate } />
                  <NavItem dropdown href="/conformance/unittests" text="Unittests" active={ this.state.active } click={ this.navigate } />
                </DropdownMenu>
              </UncontrolledDropdown>


            </ul>
            <ul className="nav navbar-nav ml-auto">
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  Hello, { this.props.username }
                </DropdownToggle>
                <DropdownMenu right>
                  { this.props.admin ? <NavItem dropdown external href="/admin" text="Admin" target="_blank" active={ this.state.active } /> : '' }
                  <NavItem dropdown href="/account/change_password/" text="Change Password" active={ this.state.active } click={ this.navigate }/>
                  <DropdownItem divider />
                  <NavItem dropdown href="/logout" text="Logout" active={ this.state.active } click={ this.navigate }/>
                </DropdownMenu>
              </UncontrolledDropdown>
            </ul>
          </div>
        </div>
      </nav>
    );
  }

  render() {
    if (this.props.isAuthenticated) {
      this.setSize();
      return (
        <div className="navbar-double fixed-top">
          { this.NavTop() }
          { this.NavBottom() }
          <div style={ this.themeOptionStyles }>
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
