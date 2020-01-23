import React, { Component } from 'react'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader
} from 'reactstrap'

import JADNInput from '../../utils/jadn-editor'
import JSONInput from 'react-json-editor-ajrm'
import locale    from 'react-json-editor-ajrm/locale/en'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

import { Transport } from './'

import {
  FormatJADN,
  generateUUID4,
  validateUUID4
} from '../../utils'

import * as DeviceActions from '../../../actions/device'
import { withGUIAuth } from '../../../actions/util'

class DeviceModal extends Component {
  constructor(props, context) {
    super(props, context)
    this.toggleModal = this.toggleModal.bind(this)
    this.genUUID = this.genUUID.bind(this)
    this.registerDevice = this.registerDevice.bind(this)
    this.saveDevice = this.saveDevice.bind(this)
    this.mulitSelectChange = this.mulitSelectChange.bind(this)
    this.transportChange = this.transportChange.bind(this)
    this.transportAdd = this.transportAdd.bind(this)
    this.transportRemove = this.transportRemove.bind(this)
    this.jadn_keys = ["meta", "types"]

    this.register = this.props.register == true
    this.defaultDevice = {
      device_id: 'UUID',
      name: 'Device',
      note: '',
      transport: [
        {
          host: '127.0.0.1',
          port: 5001,
          protocol: 'HTTPS',
          topic: "topic",
          channel: "channel",
          serialization: ['JSON']
        }
      ]
    }

    this.state = {
      modal: false,
      jadn_fmt: false,
      device: {
        ...this.defaultDevice
      },
      error: null
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    let props_update = this.props != nextProps
    let state_update = this.state != nextState

    return props_update || state_update
  }

  toggleModal() {
    this.setState({
      modal: !this.state.modal,
      device: {
        ...this.defaultDevice,
        ...(this.register ? {} : this.props.data)
      }
    })
  }

  genUUID() {
    this.setState(prevState => ({
      device: {
        ...prevState.device,
        device_id: generateUUID4()
      }
    }))
  }

  mulitSelectChange(e) {
    let id = e.target.id
    let val = e.target.value
    let tmpVal = this.state.device[id]
    let valIdx = tmpVal.indexOf(val)

    if (valIdx >= 0) { // Remove value
      tmpVal.splice(valIdx, 1)
    } else { // Add value
      tmpVal.push(val)
    }

    this.setState(prevState => ({
      device: {
        ...prevState.device,
        [id]: tmpVal
      }
    }))
  }

  transportChange(d, i) {
    let tmpTrans = [
      ...this.state.device.transport
    ]
    tmpTrans[i] = d

    this.setState(prevState => ({
      device: {
        ...prevState.device,
        transport: tmpTrans
      }
    }))
  }

  transportAdd(e) {
    e.preventDefault()
    let tmpTrans = [
      ...this.state.device.transport,
      {
        host: '127.0.0.1',
        port: 5001,
        protocol: 'HTTPS',
        serialization: ['JSON']
      }
    ]
    this.setState(prevState => ({
      device: {
        ...prevState.device,
        transport: tmpTrans
      }
    }))
  }

  transportRemove(i) {
    if (this.state.device.transport.length > 1) {
      let tmpTrans = [
        ...this.state.device.transport
      ]
      delete tmpTrans[i]

      this.setState(prevState => ({
        device: {
          ...prevState.device,
          transport: tmpTrans.filter(t => [undefined, null, {}].indexOf(t) == -1)
        }
      }))
    } else {
      toast(<div><p>Error Transport:</p><p>A device must have at minimum one transport</p></div>, {type: toast.TYPE.WARNING})
    }
  }

  transportValidate() {
    let counts = {}
    this.state.device.transport.forEach(t => {
      let proto = t.protocol
      counts[t.protocol] = (counts[t.protocol] || 0) + 1
    })
    return Object.keys(counts).map(k => counts[k] === 1).every(itm => itm)
  }

  registerDevice() {
    if (!this.transportValidate()) {
      toast(<div><p>Error Transport:</p><p>A device can only have at most one of each type of transport protocol</p></div>, {type: toast.TYPE.WARNING})

    } else if (!validateUUID4(this.state.device.device_id)) {
      toast(<div><p>Error Device ID:</p><p>The ID given is not a valid UUIDv4</p></div>, {type: toast.TYPE.WARNING})

    } else {
      Promise.resolve(this.props.createDevice(this.state.device)).then(() => {
        setTimeout(() => {
          let errs = this.props.errors[DeviceActions.CREATE_DEVICE_FAILURE] || {}
          if (Object.keys(errs).length == 0) {
            this.toggleModal()
          } else {
            if (errs.hasOwnProperty('non_field_errors')) {
              Object.values(errs).forEach(err => {
                if (typeof(err) == 'object') {
                  err.forEach(e => toast(<p>Error: { e }</p>, {type: toast.TYPE.WARNING}) )
                } else {
                  toast(<p>Error: { err }</p>, {type: toast.TYPE.WARNING})
                }
              })
            } else {
              Object.keys(errs).forEach(err => {
               toast(<div><p>Error { err }:</p><p>{ errs[err] }</p></div>, {type: toast.TYPE.WARNING})
              })
            }
          }
        }, 500)
      })
    }
  }

  saveDevice() {
    if (!this.transportValidate()) {
      toast(<div><p>Error Transport:</p><p>A device can only have at most one of each type of transport protocol</p></div>, {type: toast.TYPE.WARNING})

    } else {
      Promise.resolve(this.props.updateDevice(this.state.device.device_id, this.state.device)).then(() => {
        setTimeout(() => {
          let errs = this.props.errors[DeviceActions.UPDATE_DEVICE_FAILURE] || {}
          if (Object.keys(errs).length == 0) {
            this.toggleModal()
          } else {
            if (errs.hasOwnProperty('non_field_errors')) {
              Object.values(errs).forEach(err => {
                toast(<p>Error: { err }</p>, {type: toast.TYPE.WARNING})
              })
            } else {
              Object.keys(errs).forEach(err => {
                toast(<div><p>Error { err }:</p><p>{ errs[err] }</p></div>, {type: toast.TYPE.WARNING})
              })
            }
          }
        }, 500)
      })
    }
  }

  render() {
    let Editor = this.state.jadn_fmt ? JADNInput : JSONInput
    let transports = this.state.device.transport.map((trans, i) => (
      <Transport
        key={ i }
        index={ i }
        data={ trans }
        change={ this.transportChange }
        remove={ this.transportRemove }
      />
    ))

    return (
      <div className={ 'd-inline-block ' + this.props.className }>
        <Button color='primary' size='sm' onClick={ this.toggleModal } >{ this.register ? 'Register' : 'Edit' }</Button>

        <Modal isOpen={ this.state.modal } toggle={ this.toggleModal } size='lg'>
          <ModalHeader toggle={ this.toggleModal }>{ this.register ? 'Register' : 'Edit' }  Device</ModalHeader>
          <ModalBody>
            <form onSubmit={ () => false }>
              <div className="form-row">
                <div className="form-group col-lg-6">
                  <label htmlFor="name">Name</label>
                  <input type="text" className="form-control" id='name' value={ this.state.device.name } onChange={ (e) => this.setState({ device: {...this.state.device, name: e.target.value }}) } />
                </div>

                <div className="form-group col-lg-6">
                  <label htmlFor="device_id">Device ID</label>
                  <div className="input-group">
                    <input type="text" className="form-control" id="device_id" readOnly={ !this.register } value={ this.state.device.device_id } onChange={ (e) => this.setState({ device: {...prevState.device, device_id: e.target.value }}) } />
                    <div className="input-group-append">
                      <Button color="info" disabled={ !this.register } onClick={ this.genUUID } >Gen ID</Button>
                    </div>
                  </div>
                </div>
              </div>

              <fieldset className='border p-2'>
                <legend>
                  Transports
                  <Button color="info" size='sm' className='float-right' onClick={ this.transportAdd } >
                    <FontAwesomeIcon icon={ faPlus } />
                  </Button>
                </legend>
                <div style={{maxHeight: '275px', overflowY: 'scroll'}}>
                  { transports }
                </div>
              </fieldset>

              <div className="form-row">
                <div className="form-group col-lg-6">
                  <label htmlFor="note">Note</label>
                  <textarea className="form-control" id="note" value={ this.state.device.note } onChange={ (e) => this.setState({ device: {...this.state.device, note: e.target.value }}) } />
                </div>
              </div>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={ this.register ? this.registerDevice : this.saveDevice }>{ this.register ? 'Register' : 'Save' }</Button>
            <Button color="danger" onClick={ this.toggleModal }>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  errors: state.Device.errors,
  admin: state.Auth.access.admin
})


const mapDispatchToProps = (dispatch) => ({
  createDevice: (dev) => dispatch(DeviceActions.createDevice(dev)),
  updateDevice: (devUUID, dev) => dispatch(DeviceActions.updateDevice(devUUID, dev))
})

export default connect(mapStateToProps, mapDispatchToProps)(DeviceModal)
