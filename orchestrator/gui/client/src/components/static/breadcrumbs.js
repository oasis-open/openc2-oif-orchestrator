import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as AuthActions from '../../actions/auth'

class Breadcrumbs extends Component {
  constructor(props, context) {
    super(props, context)
    this.pathname = this.props.history.location.pathname
    this.crumbs = this.pathname.replace(/|\/$/g, '').split('/')
  }

  navigate(e) {
    e.preventDefault()
    if (e.target.href === null || e.target.href === undefined ) return;
    let href = e.target.href.replace(window.location.origin, '')

    this.props.navigate({
      pathname: href
    })

    this.setState({
      active: href
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    let pathname = nextProps.history.location.pathname
    if (pathname == this.pathname) return false;
    this.pathname = pathname
    this.crumbs = this.pathname.replace(/^\/|\/$/g, '').split('/')
    return true;
  }

  render() {
    if (this.props.isAuthenticated) {
      let crumbs = this.crumbs.map((crumb, i) => {
        if (crumb == '') { return }
        let crumbName = crumb.split(/[\s-_]/g).map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ')
        let crumbURL = this.crumbs.slice(0, i+1).join('/')
        crumbURL = crumbURL.charAt(0) == '/' ? crumbURL : '/' + crumbURL

        return (
          <li
            key={ i }
            className={ "breadcrumb-item" + (i == (this.crumbs.length-1) ? ' active' : '') }
            aria-current={ i == (this.crumbs.length-1) ? 'page' : undefined }
          >
            {
              i == this.crumbs.length-1 ?
                crumbName
              :
                <a href={ crumbURL } onClick={ this.navigate.bind(this) } >{ crumbName }</a>
            }
          </li>
        )
      })

      return (
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li
              className={ "breadcrumb-item" + (this.crumbs[0] == '' ? ' active' : '') }
              aria-current={ this.crumbs[0] == '' ? 'page' : undefined }
            >
              { this.crumbs[0] == '' ? 'Home' : <a href='/' onClick={ this.navigate.bind(this) } >Home</a> }
            </li>

            { crumbs }
          </ol>
        </nav>
      )
    }
    return (<div></div>)
  }
}

const mapStateToProps = (state) => ({
  history: state.Router || state.router,
  isAuthenticated: AuthActions.isAuthenticated(state.Auth)
})

export default connect(mapStateToProps)(Breadcrumbs)
