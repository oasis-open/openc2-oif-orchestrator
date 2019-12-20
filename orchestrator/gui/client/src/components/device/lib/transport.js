import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'

import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader
} from 'reactstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

import * as DeviceActions from '../../../actions/device'
import { withGUIAuth } from '../../../actions/util'

class Transport extends Component {
  constructor(props, context) {
    super(props, context)
    this.checkboxChange = this.checkboxChange.bind(this)
    this.transportRemove = this.transportRemove.bind(this)
    this.transportChange = this.transportChange.bind(this)


    this.state = {
      host: '127.0.0.1',
      port: 8080,
      protocol: 'HTTPS',
      serialization: ['JSON'],
      ...this.props.data
    }
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  shouldComponentUpdate(nextProps, nextState) {
    let props_update = this.props != nextProps
    let state_update = this.state != nextState

    if (props_update && this.mounted) {
      setTimeout(() => this.setState(this.props.data), 10)
    }

    return props_update || state_update
  }

  checkboxChange(e) {
    const name = e.target.name
    const item = e.target.id.replace(/^checkbox_\d+_/, '')

    let tmpVal = this.state[name]
    let index = tmpVal.indexOf(item)

    if (e.target.checked) {
      if (index === -1) tmpVal.push(item);
    } else {
      if (index >= 0 && tmpVal.length > 1) tmpVal.splice(index, 1);
    }

    this.setState(prevState => ({
      [name]: tmpVal
    }), () => {
      this.props.change(this.state, this.props.index)
    })
  }

  transportRemove(e) {
    e.preventDefault()
    this.props.remove(this.props.index)
  }

  transportChange(e, reset=false) {
    let tmpState = {}
    if (reset) {
      tmpState = e
    } else {
      tmpState[e.target.name] = e.target.value
    }

    this.setState(
      tmpState,
      () => {
        this.props.change(this.state, this.props.index)
      }
    )
  }

  transportPubSub() {
    let protocols = Object.keys(this.props.orchestrator.protocols).map((p, i) => <option key={ i } value={ p }>{ p }</option> )
    let pub_sub = this.props.orchestrator.protocols[this.state.protocol]
    let chan_top = ''
    let columns = 'col-6'

    if (pub_sub) {
      columns = 'col-md-4 col-sm-12'
      chan_top = [(
        <div key={ 0 } className={ "form-group " + columns }>
          <label htmlFor="topic">Topic</label>
          <input type="text" className="form-control" name='topic' value={ this.state.topic } onChange={ this.transportChange } />
        </div>), (
        <div key={ 1 } className={ "form-group " + columns }>
          <label htmlFor="channel">Channel</label>
          <input type="text" className="form-control" name='channel' value={ this.state.channel } onChange={ this.transportChange } />
        </div>
      )]
    }

    return (
      <div className="form-row">
        <div className={ "form-group " + columns }>
          <label htmlFor="protocol">Protocol</label>
          <select className="form-control" name='protocol' value={ this.state.protocol } onChange={ this.transportChange } >
            { protocols }
          </select>
        </div>
        { chan_top }
      </div>
    )
  }

  render() {
    let serializations = this.props.orchestrator.serializations.map((s, i) => (
      <div key={ i } className="form-check-inline">
        <label className="form-check-label">
          <input id={ `checkbox_${i}_${s}` } className="form-check-input" name='serialization' type="checkbox" checked={ this.state.serialization.indexOf(s) >= 0 } onChange={ this.checkboxChange } />
          { s }
        </label>
      </div>
    ))

    return (
      <div className='border mb-2 p-2'>
        <Button color="danger" size='sm' className='float-right' onClick={ this.transportRemove } >
          <FontAwesomeIcon
            icon={ faTimes }
          />
        </Button>
        <div className="form-row">
          <div className="form-group col-lg-6">
            <label htmlFor="host">Host</label>
            <input type="text" className="form-control" name='host' value={ this.state.host } onChange={ this.transportChange } />
          </div>

          <div className="form-group col-lg-6">
            <label htmlFor="port">Port</label>
            <input type="text" className="form-control" name='port' value={ this.state.port } onChange={ this.transportChange } />
          </div>
        </div>

        { this.transportPubSub() }

        <div className="form-row">
          <div className="form-group col-12">
            <div>
              <p>Serializations</p>
            </div>
            { serializations }
          </div>
        </div>
      </div>
    )
  }
}

Transport.propTypes = {
  data: PropTypes.object,
  change: PropTypes.func,
  remove: PropTypes.func,
};

Transport.defaultProps = {
  data: {},
  change: (d, i) => {},
  remove: (i) => {}
};

const mapStateToProps = (state) => ({
  orchestrator: {
    // ...state.Orcs.selected,
    protocols: state.Util.protocols,
    serializations: state.Util.serializations,
  }
})

export default connect(mapStateToProps)(Transport)
