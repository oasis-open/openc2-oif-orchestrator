import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import qs from 'query-string'

import {
  Button,
  Input
} from 'reactstrap'

import classnames from 'classnames'

import {
  CommandTable,
  CommandInfo,
  GenerateCommands
} from './pages'

import * as CommandActions from '../../actions/command'

const str_fmt = require('string-format')

class Commands extends Component {
  constructor(props, context) {
    super(props, context)
    this.commandInfo = this.commandInfo.bind(this)
    this.validPages = ['', 'info', 'generate']
    this.commandUpdate = null
    this.updateIntervals = [5, 10, 15, 20, 25, 30]

    this.state = {
      updateInterval: 10 // seconds
    }
  }

  componentDidMount() {
    this.commandUpdate = setInterval(this.props.getCommands, this.state.updateInterval * 1000)
  }

  componentWillUnmount() {
    clearInterval(this.commandUpdate)
  }

  commandInfo(cmd) {
    this.props.history.push({
      pathname: str_fmt('/command/info/{cmd}', {cmd: cmd})
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    let props_update = this.props !== nextProps
    let state_update = this.state !== nextState

    if (state_update) {
      clearInterval(this.commandUpdate)
      this.commandUpdate = setInterval(this.props.getCommands, nextState.updateInterval * 1000)
    }

    return props_update || state_update
  }

  getContent(page, command) {
    let content = []
    switch (page) {
      case 'generate':
        content = (
          <h1>Command Generator</h1>,
          <GenerateCommands />
        )
        break;
      case 'info':
        content = (
          <h1>Command { command } Info</h1>,
          <CommandInfo command_id={ command } />
        )
        break;
      default:
        content = (
          <h1>Commands</h1>,
          <CommandTable cmdInfo={ this.commandInfo } />
        )
        break;
    }
    return (
      <div className="col-12">
        { content }
      </div>
    )
  }

  updateIntervalOptions() {
    let options = this.updateIntervals.map((interval, i) => (
      <li key={ i }>
        <a
          href='#'
          className={ 'dropdown-item' + (interval === this.state.updateInterval ? ' active' : '') }
          onClick={ () => this.setState({ updateInterval: interval }) }
        >
          { interval === this.state.updateInterval ? '* ' : '' }{ interval }
        </a>
      </li>
    ))

    return (
      <div
        className='dropdown dropdown-menu-right'
        style={{
          position: 'fixed',
          bottom: '5px',
          left: '5px'
        }}
      >
        <Button
          color='default'
          size='sm'
          className='dropdown-toggle'
          data-toggle='dropdown'
          aria-haspopup='true'
          aria-expanded='true'
        >
          Update Intervals
        </Button>

        <ul className='dropdown-menu'>
          { options }
        </ul>
      </div>
    )
  }

  render() {
    let {page, command} = this.props.match.params
    page = this.validPages.indexOf(page) ===  -1 ? '' : page

    let meta = {
      title: str_fmt('{base} | Command {page}', {base: this.props.siteTitle, page: page}),
      canonical: str_fmt('{origin}{path}', {origin: window.location.origin, path: window.location.pathname})
    }

    return (
      <div className="row mx-auto">
        <Helmet>
          <title>{ meta.title }</title>
          <link rel="canonical" href={ meta.canonical } />
        </Helmet>
        { this.getContent(page, command) }
        { this.updateIntervalOptions() }
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  siteTitle: state.Util.site_title,
  orchestrator: {
    name: state.Util.name || 'N/A'
  },
  admin: state.Auth.access.admin
})

const mapDispatchToProps = (dispatch) => ({
  getCommands: (page, sizePerPage, sort) => dispatch(CommandActions.getCommands(page, sizePerPage, sort)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Commands)
