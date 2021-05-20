import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { ConnectedProps, connect } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Button, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader
} from 'reactstrap';
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';
import { validate as uuidValidate, version as uuidVersion, v4 as uuid4 } from 'uuid';
import { objectValues, safeGet } from '../utils';
import { Actuator, Device } from '../../actions';
import { RootState } from '../../reducers';

// Const Vars
const DefaultActuator: Actuator.Actuator = {
  name: 'Actuator',
  profile: '',
  actuator_id: 'UUID',
  device: 'Parent UUID',
  schema: {}
};

// Interfaces
interface ActuatorModalProps {
  className?: string;
  data?: {
    device: string;
  };
  register?: boolean;
}

interface ActuatorModalState {
  modal: boolean;
  actuator: Actuator.Actuator
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  devices: state.Device.devices,
  errors: state.Actuator.errors,
  orchestrator: {
    // ...state.Orcs.selected,
    protocols: state.Util.protocols,
    serializations: state.Util.serializations
  }
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  createActuator: (act: Actuator.Actuator) => dispatch(Actuator.createActuator(act)),
  getDevice: (devUUID: string) => dispatch(Device.getDevice(devUUID)),
  getDevices: () => dispatch(Device.getDevices()),
  updateActuator: (actUUID: string, act: Actuator.Actuator) => dispatch(Actuator.updateActuator(actUUID, act))
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type ActuatorModalConnectedProps = ActuatorModalProps & ConnectorProps;

// Component
class ActuatorModal extends Component<ActuatorModalConnectedProps, ActuatorModalState> {
  register: boolean;
  schemaUpload?: HTMLInputElement;
  defaultParent?: Device.Device;

  constructor(props: ActuatorModalConnectedProps) {
    super(props);
    this.toggleModal = this.toggleModal.bind(this);
    this.genUUID = this.genUUID.bind(this);
    this.changeParent = this.changeParent.bind(this);
    this.registerActuator = this.registerActuator.bind(this);
    this.saveActuator = this.saveActuator.bind(this);
    this.loadSchema = this.loadSchema.bind(this);
    this.textAreaChange = this.textAreaChange.bind(this);
    this.updateActuator = this.updateActuator.bind(this);
    const { register } = this.props;
    this.register = register === true;

    this.state = {
      modal: false,
      actuator: {
        ...DefaultActuator
      }
    };
  }

  componentDidMount() {
    const {
      data, devices, getDevice, getDevices
    } = this.props;

    if (this.register) {
      if (devices.length === 0) {
        getDevices();
      } else {
        // eslint-disable-next-line prefer-destructuring
        this.defaultParent = devices[0];
      }
    } else if (data) {
      if (devices.length >= 1) {
        const tmpParent = devices.filter(d => d.name === data.device);
        this.defaultParent = tmpParent.length === 1 ? tmpParent[0] : undefined;
      } else {
        getDevice(data.device);
      }
    }
    this.setState(prevState => ({
      actuator: {
        ...prevState.actuator,
        device: this.defaultParent ? safeGet(this.defaultParent as Record<string, any>, 'name', 'Parent UUID') : ''
      }
    }));
  }

  shouldComponentUpdate(nextProps: ActuatorModalConnectedProps, nextState: ActuatorModalState) {
    const propsUpdate = this.props !== nextProps;
    const stateUpdate = this.state !== nextState;

    // eslint-disable-next-line max-len
    if (nextProps.devices.length >= 1 && !(uuidValidate(nextState.actuator.device) && uuidVersion(nextState.actuator.device) === 4)) {
      const { devices } = this.props;
      const { actuator } = this.state;
      const tmpParent = devices.filter(d => d.name === actuator.device);
      this.defaultParent = tmpParent.length === 1 ? tmpParent[0] : devices[0] || {};

      // eslint-disable-next-line no-param-reassign
      nextState.actuator.device = DefaultActuator.device;
    }
    return propsUpdate || stateUpdate;
  }

  genUUID() {
    this.setState(prevState => ({
      actuator: {
        ...prevState.actuator,
        actuator_id: uuid4()
      }
    }));
  }

  toggleModal() {
    const { data } = this.props;
    this.setState(prevState => ({
      modal: !prevState.modal,
      actuator: {
        ...DefaultActuator,
        ...(this.register ? {} : data)
      }
    }));
  }

  changeParent(e: React.ChangeEvent<HTMLSelectElement>) {
    const { devices } = this.props;
    const parents = devices.filter(dev => dev.device_id === e.target.value);
    const parent = parents.length === 1 ? parents[0] : undefined;

    this.setState(prevState => ({
      actuator: {
        ...prevState.actuator,
        device: parent?.device_id || ''
      }
    }));
  }

  registerActuator() {
    const { actuator } = this.state;

    if (uuidValidate(actuator.actuator_id) && uuidVersion(actuator.actuator_id) === 4) {
      const { createActuator } = this.props;
      createActuator(actuator);
      setTimeout(() => this.checkErrors(Actuator.CREATE_ACTUATOR_FAILURE), 1000);
    } else {
      toast(
        <div>
          <p>Error Actuator ID:</p>
          <p>The ID given is not a valid UUIDv4</p>
        </div>,
        { type: toast.TYPE.WARNING }
      );
    }
  }

  saveActuator() {
    const { updateActuator } = this.props;
    const { actuator } = this.state;
    updateActuator(actuator.actuator_id, actuator);
    setTimeout(() => this.checkErrors(Actuator.UPDATE_ACTUATOR_FAILURE), 1000);
  }

  checkErrors(errKey: string) {
    if (errKey) {
      const { errors } = this.props;

      const errs = errors[errKey] || {};
      if (Object.keys(errs).length === 0) {
        this.toggleModal();
        return;
      }

      if ('non_field_errors' in errs) {
        objectValues(errs).forEach(err => {
          toast(
            <p>{ `Error: ${ err }`}</p>,
            { type: toast.TYPE.WARNING}
          );
        });
      } else {
        Object.keys(errs).forEach(err => {
          toast(
            <div>
              <p>{ `Error ${ err }:`}</p>
              <p>{ errs[err] }</p>
            </div>,
            { type: toast.TYPE.WARNING }
          );
        });
      }
    }
  }

  loadSchema(e: React.ChangeEvent<HTMLInputElement>) {
    const { files } = e.target;
    if (files) {
      const file = files[0];
      const fileReader = new FileReader();

      fileReader.onload = f => {
        if (f.target) {
          const { result } = f.target;
          if (result) {
            const data = atob((result as string).split(',')[1]);
            try {
              this.setState(prevState => ({
                actuator: {
                  ...prevState.actuator,
                  schema: JSON.parse(data)
                }
              }));
            } catch (err) {
              toast(
                <p>{ `Schema cannot be loaded: ${ err }` }</p>,
                { type: toast.TYPE.WARNING }
              );
            }
          }
        }
      };
      fileReader.readAsDataURL(file);
    }
  }

  textAreaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    e.preventDefault();
    try {
      this.setState(prevState => ({
        actuator: {
          ...prevState.actuator,
          schema: JSON.parse(e.target.value)
        }
      }));
    } catch (err) {
      toast(
        <p>{ `Schema is not valid: ${ err }` }</p>,
        { type: toast.TYPE.WARNING }
      );
    }
  }

  updateActuator(e: React.ChangeEvent<HTMLInputElement>) {
    const target = e.currentTarget;

    this.setState(prevState => ({
      actuator: {
        ...prevState.actuator,
        [target.id]: target.value
      }
    }));
  }

  render() {
    const { className, devices } = this.props;
    const { actuator, modal } = this.state;

    const deviceOptions = devices.map(d => <option key={ d.device_id } value={ d.device_id }>{ d.name }</option> );

    return (
      <div className={ `d-inline-block ${className}` }>
        <Button color="primary" size="sm" onClick={ this.toggleModal } >
          { this.register ? 'Register' : 'Edit' }
        </Button>

        <Modal isOpen={ modal } toggle={ this.toggleModal } size="lg" >
          <ModalHeader toggle={ this.toggleModal }>{ `${ this.register ? 'Register' : 'Edit' } Actuator` }</ModalHeader>
          <ModalBody>
            <form onSubmit={ () => false }>
              <div className="form-row">
                <div className="form-group col-lg-6">
                  <Label for="name">Name</Label>
                  <Input
                    id="name"
                    className="form-control"
                    type="text"
                    value={ actuator.name || '' }
                    onChange={ this.updateActuator }
                  />
                </div>

                <div className="form-group col-lg-6">
                  <Label for="actuator_id">Actuator ID</Label>
                  <div className="input-group">
                    <Input
                      id="actuator_id"
                      className="form-control"
                      type="text"
                      readOnly={ !this.register }
                      value={ actuator.actuator_id }
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
                  <Label for="parent_dev">Parent Device</Label>
                  <select
                    id="parent_dev"
                    className="form-control"
                    value={ actuator.device }
                    onChange={ this.changeParent }
                  >
                    { deviceOptions }
                  </select>
                </div>
              </div>

              <div className="form-control border card-body p-0" style={{ height: '250px' }}>
                <JSONInput
                  id="schema"
                  placeholder={ actuator.schema }
                  onChange={
                    val => {
                      if (val.jsObject) {
                        this.setState(prevState => ({
                          actuator: {
                            ...prevState.actuator,
                            schema: val.jsObject
                          }
                        }));
                      }
                    }
                  }
                  theme="light_mitsuketa_tribute"
                  locale={ locale }
                  reset={ false }
                  height="100%"
                  width="100%"
                />
              </div>
              <div className="clearfix">
                <Button color="info" size="sm" className="float-right" onClick={ () => this.schemaUpload?.click() }>
                  Upload Schema
                </Button>
                <input
                  type="file"
                  className="d-none"
                  ref={ e => { this.schemaUpload = e || undefined; } }
                  accept="application/json, .json"
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

export default connector(ActuatorModal);
