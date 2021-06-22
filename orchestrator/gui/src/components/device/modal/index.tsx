import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { ConnectedProps, connect } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Button, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader
} from 'reactstrap';
import { validate as uuidValidate, version as uuidVersion, v4 as uuid4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Transport, { DefaultTransport } from './transport';
import { objectValues, removeEmpty } from '../../utils';
import { Device } from '../../../actions';
import { RootState } from '../../../reducers';

// Interfaces
interface DeviceModalProps {
  className?: string;
  data?: Device.Device;
  register?: boolean;
}

interface DeviceModalState {
  modal: boolean;
  device: Device.Device;
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  errors: state.Device.errors
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  createDevice: (dev: Device.Device) => dispatch(Device.createDevice(dev)),
  updateDevice: (devUUID: string, dev: Device.Device) => dispatch(Device.updateDevice(devUUID, dev))
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type DeviceModalConnectedProps = DeviceModalProps & ConnectorProps;

// Component
const DefaultDevice = {
  device_id: 'UUID',
  name: 'Device',
  note: '',
  transport: [
    DefaultTransport
  ]
};

class DeviceModal extends Component<DeviceModalConnectedProps, DeviceModalState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    className: '',
    data: undefined,
    register: false
  }

  constructor(props: DeviceModalConnectedProps) {
    super(props);
    this.toggleModal = this.toggleModal.bind(this);
    this.genUUID = this.genUUID.bind(this);
    this.checkErrors = this.checkErrors.bind(this);
    this.registerDevice = this.registerDevice.bind(this);
    this.saveDevice = this.saveDevice.bind(this);
    this.transportChange = this.transportChange.bind(this);
    this.transportAdd = this.transportAdd.bind(this);
    this.transportRemove = this.transportRemove.bind(this);
    this.updateDevice = this.updateDevice.bind(this);

    this.state = {
      modal: false,
      device: {
        ...DefaultDevice
      }
    };
  }

  toggleModal() {
    const { data, register } = this.props;
    this.setState(prevState => ({
      modal: !prevState.modal,
      device: {
        ...DefaultDevice,
        ...(register ? {} : data)
      }
    }));
  }

  genUUID() {
    this.setState(prevState => ({
      device: {
        ...prevState.device,
        device_id: uuid4()
      }
    }));
  }

  transportChange(d: Device.Transport, i: number) {
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

  transportAdd(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    const { device } = this.state;
    const tmpTrans = [
      ...device.transport,
      DefaultTransport
    ];
    this.setState(prevState => ({
      device: {
        ...prevState.device,
        transport: tmpTrans
      }
    }));
  }

  transportRemove(i: number) {
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
    if (!(uuidValidate(device.device_id) && uuidVersion(device.device_id) === 4)) {
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
    createDevice(data as Device.Device);
    setTimeout(() => this.checkErrors(Device.CREATE_DEVICE_FAILURE), 1000);
  }

  saveDevice() {
    const { updateDevice } = this.props;
    const { device } = this.state;
    updateDevice(device.device_id, device);
    setTimeout(() => this.checkErrors(Device.UPDATE_DEVICE_FAILURE), 1000);
  }

  checkErrors(errKey: string) {
    const { errors } = this.props;

    const errs = errors[errKey] || {};
    if (Object.keys(errs).length === 0) {
      this.toggleModal();
      return;
    }
    if ('non_field_errors' in errs) {
      objectValues(errs).forEach(err => {
        if (Array.isArray(err)) {
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
          // TODO: fix typing
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

  updateDevice(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { id, value } = e.currentTarget;

    this.setState(prevState => ({
      device: {
        ...prevState.device,
        [id]: value
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

export default connector(DeviceModal);
