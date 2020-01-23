import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet-async'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'

import { UserModal } from '../lib'

import { RemotePageTable } from '../../utils'

import * as AccountActions from '../../../actions/account'

const str_fmt = require('string-format')

class Users extends Component {
  constructor(props, context) {
    super(props, context)

    this.meta = {
      title: str_fmt('{base} | {page}', {base: this.props.siteTitle, page: 'Admin - Users'}),
      canonical: str_fmt('{origin}{path}', {origin: window.location.origin, path: window.location.pathname})
    }

    this.tableColumns = [
      {
        text: 'Active',
        dataField: 'is_active',
        sort: true,
        formatter: (cell, row) => ( <div className="d-flex justify-content-center"><FontAwesomeIcon icon={ cell ? faCheck : faTimes } size="lg" color={ cell ? "green" : "red" } /></div> )
      },{
        text: 'Username',
        dataField: 'username',
        sort: true
      },{
        text: 'First Name',
        dataField: 'first_name',
        sort: true
      },{
        text: 'Last Name',
        dataField: 'last_name',
        sort: true
      },{
        text: 'Email',
        dataField: 'email',
        sort: false
      }
    ]

    this.editOptions = {
      modal: UserModal,
      delete: this.props.deleteAccount
    }

    if (this.props.accounts.loaded === 0) {
      this.props.getAccounts()
    }

    this.props.getAccounts()
  }

  render() {
    return (
      <div className="row mx-auto">
        <Helmet>
          <title>{ this.meta.title }</title>
          <link rel="canonical" href={ this.meta.canonical } />
        </Helmet>
        <div className="col-12">
          <div className="col-12">
            <UserModal register className="float-right mt-2" />
            <h1>Users</h1>
          </div>

          <RemotePageTable
            keyField='username'
            dataKey='Account.accounts'
            dataGet={ this.props.getAccounts }
            columns={ this.tableColumns }
            editRows
            editOptions={ this.editOptions }
            defaultSort={[
              {
                dataField: 'username',
                order: 'desc'
              },{
                dataField: 'last_name',
                order: 'desc'
              },{
                dataField: 'first_name',
                order: 'desc'
              }
            ]}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  siteTitle: state.Util.site_title,
  accounts: {
    users: state.Account.accounts,
    loaded: state.Account.accounts.length,
    total: state.Account.count
  }
})

const mapDispatchToProps = (dispatch) => ({
  getAccounts: () => dispatch(AccountActions.getAccounts()),
  deleteAccount: (acnt) => dispatch(AccountActions.deleteAccount(acnt))
})

export default connect(mapStateToProps, mapDispatchToProps)(Users)
