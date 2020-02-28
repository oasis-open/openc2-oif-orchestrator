import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';

import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader
} from 'reactstrap';

import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';
import JADNInput from '../../utils/jadn-editor';

import { generateUUID4, validateUUID4 } from '../../utils';

import * as ActuatorActions from '../../../actions/actuator';
import * as DeviceActions from '../../../actions/device';

class ActuatorModal extends Component {
  constructor(props, context) {
    super(props, context);

    this.toggleModal = this.toggleModal.bind(this);
    this.genUUID = this.genUUID.bind(this);
    this.changeParent = this.changeParent.bind(this);
    this.registerActuator = this.registerActuator.bind(this);
    this.saveActuator = this.saveActuator.bind(this);
    this.loadSchema = this.loadSchema.bind(this);
    this.textAreaChange = this.textAreaChange.bind(this);
    this.updateActuator = this.updateActuator.bind(this);

    this.jadn_keys = ['meta', 'types'];
    this.register = this.props.register === true;
    this.schemaUpload = null;
    this.defaultParent = {};

    this.defaultActuator = {
      name: 'Actuator',
      actuator_id: 'UUID',
      device: this.defaultParent.name || 'Parent UUID',
      schema: {}
    };

    this.state = {
      modal: false,
      jadn_fmt: false,
      actuator: {
        ...this.defaultActuator
      }
    };
  }

  componentDidMount() {
    if (this.register) {
      if (this.props.devices.length === 0) {
        this.props.getDevices();
        this.defaultParent = {};
      } else {
        this.defaultParent = this.props.devices[0];
      }
    } else if (this.props.data) {
      if (this.props.devices.length >= 1) {
        const tmpParent = this.props.devices.filter(d => d.name === this.props.data.device);
        this.defaultParent = tmpParent.length === 1 ? tmpParent[0] : {};
      } else {
        this.props.getDevice(this.props.data.device);
      }
    }
    this.defaultActuator.device = this.defaultParent.name || 'Parent UUID';
  }

  shouldComponentUpdate(nextProps, nextState) {
    const propsUpdate = this.props !== nextProps;
    const stateUpdate = this.state !== nextState;

    if (nextProps.devices.length >= 1 && !validateUUID4(nextState.actuator.device)) {
      const tmpParent = this.props.devices.filter(d => d.name === this.state.actuator.device);
      this.defaultParent = tmpParent.length === 1 ? tmpParent[0] : this.props.devices[0] || {};

      this.defaultActuator = {
        name: 'Actuator',
        actuator_id: 'UUID',
        device: this.defaultParent.device_id || 'Parent UUID',
        schema: {}
      };
      // eslint-disable-next-line no-param-reassign
      nextState.actuator.device = this.defaultActuator.device;
    }
    if (this.state.actuator.schema !== nextState.actuator.schema) {
      const schemaKeys = Object.keys(nextState.actuator.schema);
      // eslint-disable-next-line no-param-reassign
      nextState.jadn_fmt = (
        schemaKeys.length === this.jadn_keys.length
        && schemaKeys.every(v => this.jadn_keys.indexOf(v) !== -1)
      );
    }
    return propsUpdate || stateUpdate;
  }

  genUUID() {
    this.setState(prevState => ({
      actuator: {
        ...prevState.actuator,
        actuator_id: generateUUID4()
      }
    }));
  }

  toggleModal() {
    this.setState(prevState => ({
      modal: !prevState.modal,
      actuator: {
        ...this.defaultActuator,
        ...(this.register ? {} : this.props.data)
      }
    }));
  }

  changeParent(e) {
    let parent = this.props.devices.filter(dev => dev.device_id === e.target.value);
    parent = parent.length === 1 ? parent[0] : {};

    this.setState(prevState => ({
      actuator: {
        ...prevState.actuator,
        device: parent.device_id
      }
    }));
  }

  registerActuator() {
    if (validateUUID4(this.state.actuator.actuator_id)) {
      this.props.createActuator(this.state.actuator);
      setTimeout(() => this.checkErrors(ActuatorActions.CREATE_ACTUATOR_FAILURE), 1000);
    } else {
      toast(<div><p>Error Actuator ID:</p><p>The ID given is not a valid UUIDv4</p></div>, {type: toast.TYPE.WARNING});
    }
  }

  saveActuator() {
    this.props.updateActuator(this.state.actuator.actuator_id, this.state.actuator);
    setTimeout(() => this.checkErrors(ActuatorActions.UPDATE_ACTUATOR_FAILURE), 1000);
  }

  checkErrors(errKey) {
    if (errKey) {
      const errs = this.props.errors[errKey] || {};
      if (Object.keys(errs).length === 0) {
        this.toggleModal();
        return;
      }

      if ('non_field_errors' in errs) {
        Object.values(errs).forEach(err => {
         toast(<p>Error: { err }</p>, {type: toast.TYPE.WARNING});
        });
      } else {
        Object.keys(errs).forEach(err => {
         toast(<div><p>Error { err }:</p><p>{ errs[err] }</p></div>, {type: toast.TYPE.WARNING});
        });
      }
    }
  }

  loadSchema(e) {
    const file = e.target.files[0];
    const fileReader = new FileReader();

    fileReader.onload = f => {
      const data = atob(f.target.result.split(',')[1]);
      try {
        this.setState(prevState => ({
          actuator: {
            ...prevState.actuator,
            schema: JSON.parse(data)
          }
        }));
      } catch (err) {
        toast(<p>Schema cannot be loaded: {err}</p>, {type: toast.TYPE.WARNING});
      }
    };
    fileReader.readAsDataURL(file);
  }

  textAreaChange(e) {
    e.preventDefault();
    try {
      this.setState(prevState => ({
        actuator: {
          ...prevState.actuator,
          schema: JSON.parse(e.target.value)
        }
      }));
    } catch (err) {
      toast(<p>Schema is not valid: {err}</p>, {type: toast.TYPE.WARNING});
    }
  }

  updateActuator(e) {
    const target = e.currentTarget;

    this.setState(prevState => ({
      actuator: {
        ...prevState.device,
        [target.id]: target.value
      }
    }));
  }

  render() {
    const Editor = this.state.jadn_fmt ? JADNInput : JSONInput;
    const devices = this.props.devices.map(d => <option key={ d.device_id } value={ d.device_id }>{ d.name }</option> );

    return (
      <div className={ `d-inline-block ${this.props.className}` }>
        <Button color="primary" size="sm" onClick={ this.toggleModal } >{ this.register ? 'Register' : 'Edit' }</Button>

        <Modal isOpen={ this.state.modal } toggle={ this.toggleModal } size="lg" >
          <ModalHeader toggle={ this.toggleModal }>{ this.register ? 'Register' : 'Edit' } Actuator</ModalHeader>
          <ModalBody>
            <form onSubmit={ () => false }>
              <div className="form-row">
                <div className="form-group col-lg-6">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    className="form-control"
                    type="text"
                    value={ this.state.actuator.name }
                    onChange={ this.updateActuator }
                  />
                </div>

                <div className="form-group col-lg-6">
                  <label htmlFor="actuator_id">Actuator ID</label>
                  <div className="input-group">
                    <input
                      id="actuator_id"
                      className="form-control"
                      type="text"
                      readOnly={ !this.register }
                      value={ this.state.actuator.actuator_id }
                      onChange={ this.updateActuator }
                    />
                    <div className="input-group-append">
                      <Button color="info" disabled={ !this.register } onClick={ this.genUUID } >Gen ID</Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col-lg-6">
                  <label htmlFor="parent_dev">Parent Device</label>
                  <select
                    id="parent_dev"
                    className="form-control"
                    default={ this.defaultParent.device_id }
                    value={ this.state.actuator.device }
                    onChange={ this.changeParent }
                  >
                    { devices }
                  </select>
                </div>
              </div>

              <div className="form-control border card-body p-0" style={{ height: '250px' }}>
                <Editor
                  id="schema"
                  placeholder={ this.state.actuator.schema }
                  onChange={ val => {
                    if (val.jsObject) {
                      this.setState(prevState => ({
                        actuator: {
                          ...prevState.schema,
                          schema: val.jsObject
                        }
                      }));
                    }
                  }}
                  theme="light_mitsuketa_tribute"
                  locale={ locale }
                  reset={ false }
                  height="100%"
                  width="100%"
                />
              </div>
              <div className="clearfix">
                <Button color="info" size="sm" className="float-right" onClick={ () => this.schemaUpload.click() }>
                  Upload Schema
                </Button>
                <input
                  type="file"
                  className="d-none"
                  ref={ e => { this.schemaUpload = e; } }
                  accept="application/json, .jadn, .json"
                  onChange={ this.loadSchema }
                />
              </div>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={ this.register ? this.registerActuator : this.saveActuator }>
              { this.register ? 'Register' : 'Save' }
            </Button>
            <Button color="danger" onClick={ this.toggleModal }>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

ActuatorModal.propTypes = {
  createActuator: PropTypes.func.isRequired,
  devices: PropTypes.arrayOf(PropTypes.object).isRequired,
  errors: PropTypes.object.isRequired,
  getDevice: PropTypes.func.isRequired,
  getDevices: PropTypes.func.isRequired,
  orchestrator: PropTypes.shape({
    protocols: PropTypes.object,
    serializations: PropTypes.array
  }).isRequired,
  updateActuator: PropTypes.func.isRequired,
  className: PropTypes.string,
  data: PropTypes.shape({
    device: PropTypes.string
  }),
  register: PropTypes.bool
};

ActuatorModal.defaultProps = {
  className: '',
  data: {},
  register: false
};

const mapStateToProps = state => ({
  devices: state.Device.devices,
  errors: state.Actuator.errors,
  orchestrator: {
    // ...state.Orcs.selected,
    protocols: state.Util.protocols,
    serializations: state.Util.serializations
  }
});

const mapDispatchToProps = dispatch => ({
  createActuator: act => dispatch(ActuatorActions.createActuator(act)),
  getDevice: devUUID => dispatch(DeviceActions.getDevice(devUUID)),
  getDevices: () => dispatch(DeviceActions.getDevices()),
  updateActuator: (actUUID, act) => dispatch(ActuatorActions.updateActuator(actUUID, act))
});

export default connect(mapStateToProps, mapDispatchToProps)(ActuatorModal);
