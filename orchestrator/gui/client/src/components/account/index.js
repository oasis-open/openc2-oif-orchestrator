import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet-async';
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

import {
  ChangePassword
} from './lib'

import * as AccountActions from '../../actions/account'
import { withGUIAuth } from '../../actions/util'

const str_fmt = require('string-format')

class Account extends Component {
  constructor(props, context) {
    super(props, context)

    this.meta = {
      title: str_fmt('{base} | {page}', {base: this.props.siteTitle, page: 'Account'}),
      canonical: str_fmt('{origin}{path}', {origin: window.location.origin, path: window.location.pathname})
    }

    console.log(this.props.match.params.page)
    this.validPages = ['all', 'change_password']
    let page = this.props.match.params.page || 'all'

    if (this.validPages.indexOf(page) ===  -1) {
      page = 'all'
    }

    this.state = {
      activeTab: page
    }
  }

  toggleTab(tab) {
    if (this.state.activeTab !== tab) {
      this.props.history.push({
        pathname: str_fmt('/account/{tab}', {tab: tab})
      })
      this.setState({
        activeTab: tab
      })
    }
  }

  render() {
    let page = null
    switch (this.state.activeTab) {
      case 'change_password':
        page = <ChangePassword />
        break;
      default:
        page = (
          <div className="row mx-auto">
            <h1>Account Options</h1>
            <p>Todo</p>
          </div>
        )
    }

    return (
      <div >
        <Helmet>
          <title>{ this.meta.title }</title>
          <link rel="canonical" href={ this.meta.canonical } />
        </Helmet>
        { page }
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  errors: state.Account.errors,
  siteTitle: state.Util.site_title
})

export default connect(mapStateToProps)(Account)
