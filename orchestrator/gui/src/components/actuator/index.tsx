import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { ConnectedProps, connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import ActuatorModal from './modal';
import { ColumnDescriptionKeyed, RowEditOptions, RemotePageTable } from '../utils';
import { Actuator, Device } from '../../actions';
import { RootState } from '../../reducers';

// Interfaces
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ActuatorsProps {}

interface ActuatorsState {
  modal: boolean;
  actuator: Actuator.Actuator
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  siteTitle: state.Util.site_title,
  orchestrator: {
    name: state.Util.name || 'N/A'
  },
  admin: state.Auth.access?.admin || false,
  devices: {
    devices: state.Device.devices,
    loaded: state.Device.devices.length,
    total: state.Device.count
  }
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getActuators: (page?: number, count?: number, sort?: string) => dispatch(Actuator.getActuators({page, count, sort})),
  deleteActuator: (actUUID: string) => dispatch(Actuator.deleteActuator(actUUID)),
  getDevices: (page?: number, count?: number, sort?: string) => dispatch(Device.getDevices({page, count, sort}))
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type ActuatorsConnectedProps = ActuatorsProps & ConnectorProps;

// Component
class Actuators extends Component<ActuatorsConnectedProps, ActuatorsState> {
  meta: {
    title: string;
    canonical: string;
  };

  tableColumns: Array<ColumnDescriptionKeyed>;
  editOptions: RowEditOptions;

  constructor(props: ActuatorsConnectedProps) {
    super(props);
    this.getDevice = this.getDevice.bind(this);

    const {
      deleteActuator, devices, getDevices, siteTitle
    } = this.props;
    this.meta = {
      title:`${siteTitle} | Actuators`,
      canonical: `${window.location.origin}${window.location.pathname}`
    };

    this.tableColumns = [
      {
        text: 'Name',
        dataField: 'name',
        sort: true
      },
      {
        text: 'Device',
        dataField: 'device',
        sort: true,
        // eslint-disable-next-line react/no-unstable-nested-components
        formatter: (cell: string) => <span>{ this.getDevice(cell) }</span>
      },
      {
        text: 'Profile',
        dataField: 'profile',
        sort: true,
        // eslint-disable-next-line react/no-unstable-nested-components
        formatter: (cell: string) => <span>{ cell.replace(/_/g, ' ') }</span>
      }
    ];

    this.editOptions = {
      modal: ActuatorModal,
      delete: deleteActuator
    };

    if (devices.loaded === 0) {
      getDevices();
    }
  }

  getDevice(devUUID: string) {
    const { devices } = this.props;
    const loadedDevices = devices.devices.filter(d => d.device_id === devUUID);
    const device = loadedDevices.length === 1 ? loadedDevices[0] : undefined;
    return device?.name || devUUID;
  }

  render() {
    const {
      admin, devices, getActuators, getDevices, orchestrator
    } = this.props;

    setTimeout(() => {
      if (devices.loaded !== devices.total) {
        getDevices(1, devices.total);
      }
    }, 10);

    return (
      <div className="mx-auto">
        <Helmet>
          <title>{ this.meta.title }</title>
          <link rel="canonical" href={ this.meta.canonical } />
        </Helmet>
        <div className="card p-2">
          <div className='row'>
            <div className='col'>
              { admin ? <ActuatorModal register className="float-right" /> : '' }
              <h4>Actuators</h4>
            </div>
          </div>
          <RemotePageTable
            keyField='actuator_id'
            dataKey='Actuator.actuators'
            dataGet={ getActuators }
            columns={ this.tableColumns }
            editRows
            editOptions={ this.editOptions }
            defaultSort={
              [
                {
                  dataField: 'name',
                  order: 'desc'
                },
                {
                  dataField: 'profile',
                  order: 'desc'
                },
                {
                  dataField: 'device',
                  order: 'desc'
                }
              ]
            }
          />
        </div>
      </div>
    );
  }
}

export default connector(Actuators);
