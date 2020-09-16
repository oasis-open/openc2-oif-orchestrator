import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Button, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import Transport, { defaultTransport } from './transport';
import {
  generateUUID4, objectValues, removeEmpty, validateUUID4
} from '../../utils';
import * as DeviceActions from '../../../actions/device';

const defaultDevice = {
  device_id: 'UUID',
  name: 'Device',
  note: '',
  transport: [
    defaultTransport
  ]
};

class DeviceModal extends Component {
  constructor(props, context) {
    super(props, context);
    this.toggleModal = this.toggleModal.bind(this);
    this.genUUID = this.genUUID.bind(this);
    this.registerDevice = this.registerDevice.bind(this);
    this.saveDevice = this.saveDevice.bind(this);
    this.mulitSelectChange = this.mulitSelectChange.bind(this);
    this.transportChange = this.transportChange.bind(this);
    this.transportAdd = this.transportAdd.bind(this);
    this.transportRemove = this.transportRemove.bind(this);
    this.updateDevice = this.updateDevice.bind(this);

    this.state = {
      modal: false,
      device: {
        ...defaultDevice
      }
    };
  }

  toggleModal() {
    const { data, register } = this.props;
    this.setState(prevState => ({
      modal: !prevState.modal,
      device: {
        ...defaultDevice,
        ...(register ? {} : data)
      }
    }));
  }

  genUUID() {
    this.setState(prevState => ({
      device: {
        ...prevState.device,
        device_id: generateUUID4()
      }
    }));
  }

  mulitSelectChange(e) {
    const { device } = this.state;
    const { id, value } = e.target;
    const tmpVal = device[id];
    const valIdx = tmpVal.indexOf(value);

    if (valIdx >= 0) { // Remove value
      tmpVal.splice(valIdx, 1);
    } else { // Add value
      tmpVal.push(value);
    }

    this.setState(prevState => ({
      device: {
        ...prevState.device,
        [id]: tmpVal
      }
    }));
  }

  transportChange(d, i) {
    const { device } = this.state;
    const tmpTrans = [
      ...device.transport
    ];
    tmpTrans[i] = d;

    this.setState(prevState => ({
      device: {
        ...prevState.device,
        transport: tmpTrans
      }
    }));
  }

  transportAdd(e) {
    e.preventDefault();
    const { device } = this.state;
    const tmpTrans = [
      ...device.transport,
      defaultTransport
    ];
    this.setState(prevState => ({
      device: {
        ...prevState.device,
        transport: tmpTrans
      }
    }));
  }

  transportRemove(i) {
    const { device } = this.state;
    if (device.transport.length > 1) {
      const tmpTrans = [
        ...device.transport
      ];
      delete tmpTrans[i];

      this.setState(prevState => ({
        device: {
          ...prevState.device,
          transport: tmpTrans.filter(t => ![undefined, null, {}].includes(t))
        }
      }));
    } else {
      toast(
        <div>
          <p>Error Transport:</p>
          <p>A device must have at minimum one transport</p>
        </div>,
        { type: toast.TYPE.WARNING }
      );
    }
  }

  registerDevice() {
    const { device } = this.state;
    if (!validateUUID4(device.device_id)) {
      toast(
        <div>
          <p>Error Device ID:</p>
          <p>The ID given is not a valid UUIDv4</p>
        </div>,
        { type: toast.TYPE.WARNING }
      );
      return;
    }
    const { createDevice } = this.props;
    const data = removeEmpty(device);
    createDevice(data);
    setTimeout(() => this.checkErrors(DeviceActions.CREATE_DEVICE_FAILURE), 1000);
  }

  saveDevice() {
    const { updateDevice } = this.props;
    const { device } = this.state;
    const data = removeEmpty(device);
    updateDevice(device.device_id, data);
    setTimeout(() => this.checkErrors(DeviceActions.UPDATE_DEVICE_FAILURE), 1000);
  }

  checkErrors(errKey) {
    const { errors } = this.props;

    if (errKey) {
      const errs = errors[errKey] || {};
      if (Object.keys(errs).length === 0) {
        this.toggleModal();
        return;
      }

      if ('non_field_errors' in errs) {
        objectValues(errs).forEach(err => {
          if (typeof err === 'object') {
            err.forEach(e => toast(
              <p>{ `Error: ${e}` }</p>,
              { type: toast.TYPE.WARNING }
            ));
          } else {
            toast(
              <p>{ `Error: ${err}` }</p>,
              { type: toast.TYPE.WARNING }
            );
          }
        });
      } else {
        Object.keys(errs).forEach(err => {
          if (err === 'transport') {
            console.error(err, errs[err]);
            errs[err].forEach(transErr => {
              Object.keys(transErr).forEach(e => {
                toast(
                  <div>
                    <p>{ `Error ${err}-${e}:` }</p>
                    <p>{ transErr[e] }</p>
                  </div>,
                  { type: toast.TYPE.WARNING }
                );
              });
            });
          } else {
            toast(
              <div>
                <p>{ `Error: ${err}:` }</p>
                <p>{ errs[err] }</p>
              </div>,
              { type: toast.TYPE.WARNING }
            );
          }
        });
      }
    }
  }

  updateDevice(e) {
    const target = e.currentTarget;

    this.setState(prevState => ({
      device: {
        ...prevState.device,
        [target.id]: target.value
      }
    }));
  }

  render() {
    const { className, register } = this.props;
    const { device, modal } = this.state;

    const transports = device.transport.map((trans, i) => (
      <Transport
        key={ i }  // eslint-disable-line react/no-array-index-key
        index={ i }
        data={ trans }
        change={ this.transportChange }
        remove={ this.transportRemove }
      />
    ));

    return (
      <div className={ `d-inline-block ${className}` }>
        <Button color="primary" size="sm" onClick={ this.toggleModal } >
          { register ? 'Register' : 'Edit' }
        </Button>

        <Modal isOpen={ modal } toggle={ this.toggleModal } size="lg">
          <ModalHeader toggle={ this.toggleModal }>{ `${register ? 'Register' : 'Edit'} Device` }</ModalHeader>
          <ModalBody>
            <form onSubmit={ () => false }>
              <div className="form-row">
                <div className="form-group col-lg-6">
                  <Label for="name">Name</Label>
                  <Input
                    id="name"
                    className="form-control"
                    type="text"
                    value={ device.name }
                    onChange={ this.updateDevice }
                  />
                </div>

                <div className="form-group col-lg-6">
                  <Label for="device_id">Device ID</Label>
                  <div className="input-group">
                    <Input
                      id="device_id"
                      className="form-control"
                      type="text"
                      readOnly={ !register }
                      value={ device.device_id }
                      onChange={ this.updateDevice }
                    />
                    <div className="input-group-append">
                      <Button color="info" disabled={ !register } onClick={ this.genUUID } >Gen ID</Button>
                    </div>
                  </div>
                </div>
              </div>

              <fieldset className="border p-2">
                <legend>
                  Transports
                  <Button color="info" size="sm" className="float-right" onClick={ this.transportAdd } >
                    <FontAwesomeIcon icon={ faPlus } />
                  </Button>
                </legend>
                <div style={{maxHeight: '325px', overflowY: 'scroll'}}>
                  { transports }
                </div>
              </fieldset>

              <div className="form-row">
                <div className="form-group col-12">
                  <Label for="note">Note</Label>
                  <textarea
                    id="note"
                    className="form-control"
                    value={ device.note }
                    onChange={ this.updateDevice }
                  />
                </div>
              </div>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={ register ? this.registerDevice : this.saveDevice }>
              { register ? 'Register' : 'Save' }
            </Button>
            <Button color="danger" onClick={ this.toggleModal }>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

DeviceModal.propTypes = {
  createDevice: PropTypes.func.isRequired,
  updateDevice: PropTypes.func.isRequired,
  className: PropTypes.string,
  data: PropTypes.shape({
      device_id: PropTypes.string,
      name: PropTypes.string,
      note: PropTypes.string,
      transport: PropTypes.arrayOf(PropTypes.shape({
        transport_id: PropTypes.string,
        host: PropTypes.string,
        port: PropTypes.number,
        protocol: PropTypes.string,
        topic: PropTypes.string,
        channel: PropTypes.string,
        serialization: PropTypes.arrayOf(PropTypes.string)
      }))
    }),
  errors: PropTypes.object,
  register: PropTypes.bool
};

DeviceModal.defaultProps = {
  className: '',
  data: {},
  errors: {},
  register: false
};

const mapStateToProps = state => ({
  errors: state.Device.errors
});

const mapDispatchToProps = dispatch => ({
  createDevice: dev => dispatch(DeviceActions.createDevice(dev)),
  updateDevice: (devUUID, dev) => dispatch(DeviceActions.updateDevice(devUUID, dev))
});

export default connect(mapStateToProps, mapDispatchToProps)(DeviceModal);
