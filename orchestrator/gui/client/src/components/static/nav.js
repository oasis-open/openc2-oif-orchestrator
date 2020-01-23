import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import qs from 'query-string'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome } from '@fortawesome/free-solid-svg-icons'

import { ThemeChooser } from '../utils'
import * as AuthActions from '../../actions/auth'

class NavItem extends Component {
  constructor(props, context) {
    super(props, context)
    this.external = this.props.external || false
    this.dropdown = this.props.dropdown || false
  }

  render() {
    let active = (this.props.href === this.props.active)
    let href = (this.props.href || '').endsWith('/') ? this.props.href : this.props.href + '/'

    return (
      <li onClick={ this.external ? () => {} : this.props.click } className={ this.props.liClassName + active ? ' active' : '' } >
        <a href={ href } target={ this.props.target } onClick={ this.external ? () => {} : (e) => { e.preventDefault() } } className={ this.dropdown ? 'dropdown-item' : 'nav-link' } >
          { this.props.icon ? <FontAwesomeIcon icon={ this.props.icon } size='lg' /> : '' } { this.props.text }
        </a>
      </li>
    );
  }
}

class Nav extends Component {
  constructor(props, context) {
    super(props, context)
    let act = (this.props.history.location.pathname === this.prefix)
    this.topNav = null
    this.bottomNav = null
    this.navigate = this.navigate.bind(this)
    this.setSize = this.setSize.bind(this)

    this.themeOptionStyles = {
      position: 'fixed',
      bottom: '5px',
      right: '5px'
    }

    this.state = {
      active: (act ? '/' : this.props.history.location.pathname),
    }
  }

  setSize() {
    setTimeout(() => {
      if (!this.topNav || !this.bottomNav) { return; }
      let topHeight = this.topNav.getBoundingClientRect().height
      let bottomHeight = this.bottomNav.getBoundingClientRect().height

      this.bottomNav.style.marginTop = topHeight + 'px'
      document.body.style.paddingTop = (topHeight + bottomHeight + 10) + 'px'
    }, 30)
  }

  navigate(e) {
    e.preventDefault()
    if (e.target.href === null || e.target.href === undefined ) { return }
    let href = e.target.href.replace(window.location.origin, '')
    let query = {}

    this.props.history.push({
      pathname: href,
      search: qs.stringify(query)
    })

    this.setState({ active: href })
  }

  NavTop() {
    return (
      <nav className="navbar navbar-light bg-light border-0 fixed-top" ref={ (elm) => this.topNav = elm} >
        <div className="container-fluid">
          <a href="/" className="navbar-brand" onClick={ this.navigate }>{ this.props.site_title }</a>
       <p className="navbar-text float-right m-0 p-0">OpenC2 Orchestrator<br/>GUI Prototype</p>
     </div>
    </nav>
    )
  }

  NavBottom() {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top" ref={ (elm) => this.bottomNav = elm}>
        <div className="container-fluid">
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navMain" aria-controls="navMain" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navMain">
            <ul className="nav navbar-nav mr-auto">
              <NavItem href="/" text="Home" active={ this.state.active } click={ this.navigate }/>

              {/* <NavItem href="/orchestrator" text="Orchestrators" active={ this.state.active } click={ this.navigate.bind(this) }/> */}

              <NavItem href="/device" text="Devices" active={ this.state.active } click={ this.navigate }/>

              <NavItem href="/actuator" text="Actuators" active={ this.state.active } click={ this.navigate }/>

              <NavItem href="/command" text="Commands" active={ this.state.active } click={ this.navigate }/>

              <NavItem href="/command/generate" text="Command Generator" active={ this.state.active } click={ this.navigate }/>
            </ul>
            <ul className="nav navbar-nav ml-auto">
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Hello, { this.props.username }</a>
                <ul className="dropdown-menu dropdown-menu-right">
                  {
                    this.props.admin ? (
                      <NavItem dropdown external href="/admin" text="Admin" target="_blank" active={ this.state.active } />
                    ) : ''
                  }
                  {/*
                    this.props.admin ? (
                      <NavItem dropdown href="/admin" text="Admin" active={ this.state.active } click={ this.navigate }/>
                    ) : ''
                  */}
                  {/* <a className="dropdown-item" href="/preferences/" >Site Preferences</a> */}
                  {/* if user.preferences
                    <li><a className="dropdown-item" href="/account/preferences/" >User Preferences</a></li>
                  endif */}
                  <NavItem dropdown href="/account/change_password/" text="Change Password" active={ this.state.active } click={ this.navigate }/>

                  <li className="dropdown-divider" />

                  <NavItem dropdown href="/logout" text="Logout" active={ this.state.active } click={ this.navigate }/>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }

  render() {
    if (this.props.isAuthenticated) {
      this.setSize()
      return (
        <div className="navbar-double fixed-top">
          { this.NavTop() }
          { this.NavBottom() }
          <div style={ this.themeOptionStyles }>
            <ThemeChooser size='sm' change={ this.setSize } />
          </div>
        </div>
      )
    } else {
      return (<div></div>)
    }
  }
}

const mapStateToProps = (state) => ({
  errors: state.Auth.errors,
  isAuthenticated: AuthActions.isAuthenticated(state.Auth),
  username: state.Auth.access == undefined ? 'User' : state.Auth.access.username,
  admin: state.Auth.access ? state.Auth.access.admin : false,
  site_title: state.Util.site_title
})

const mapDispatchToProps = (dispatch) => ({
  logout: () => dispatch(AuthActions.logout())
})

export default connect(mapStateToProps, mapDispatchToProps)(Nav)
