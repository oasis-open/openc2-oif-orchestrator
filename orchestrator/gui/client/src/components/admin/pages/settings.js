import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet-async'

const str_fmt = require('string-format')

import { SettingsModal } from '../lib'
import { RemotePageTable } from '../../utils'

class Settings extends Component {
  constructor(props, context) {
    super(props, context)

    this.meta = {
      title: str_fmt('{base} | {page}', {base: this.props.siteTitle, page: 'Admin - Settings'}),
      canonical: str_fmt('{origin}{path}', {origin: window.location.origin, path: window.location.pathname})
    }

    this.tableColumns = [
      {
        text: 'Name',
        dataField: 'name',
        sort: true
      },{
        text: 'Value',
        dataField: 'value',
        sort: false
      },
    ]

    this.editOptions = {
      modal: SettingsModal
    }

    if (this.props.settings.loaded === 0) {
      this.props.getSettings()
    }

    this.props.getSettings()
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
            {/* <SettingsModal register className="float-right" /> */}
            <h1>Settings</h1>
          </div>

          <RemotePageTable
            keyField='id'
            dataKey='Users.users'
            dataGet={ this.props.getUsers }
            columns={ this.tableColumns }
            editRows
            editOptions={ this.editOptions }
            defaultSort={[
              {
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
  settings: {
    settings: [], //state.Settings.settings,
    loaded: 1, // state.Settings.settings.length
    total: 1, // state.Settings.count
  }
})

const mapDispatchToProps = (dispatch) => ({
  updateSetting: (set, val) => {},
  getSettings: () => {}
})

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
