import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';

import ActuatorModal from './modal';
import { RemotePageTable } from '../utils';

import * as ActuatorActions from '../../actions/actuator';
import * as DeviceActions from '../../actions/device';

class Actuators extends Component {
  constructor(props, context) {
    super(props, context);
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
        formatter: cell => <span>{ this.getDevice(cell) }</span>
      },
      {
        text: 'Profile',
        dataField: 'profile',
        sort: true,
        formatter: cell => <span>{ cell.replace(/_/g, ' ') }</span>
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

  getDevice(id) {
    const { devices } = this.props;
    let device = devices.devices.filter(d => d.device_id === id);
    device = device.length === 1 ? device[0] : {};
    return device.name || id;
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
      <div className="row mx-auto">
        <Helmet>
          <title>{ this.meta.title }</title>
          <link rel="canonical" href={ this.meta.canonical } />
        </Helmet>
        <div className="col-12">
          <div className="col-12">
            { admin ? <ActuatorModal register className="float-right" /> : '' }
            <h1>{ `${orchestrator.name} Actuators` }</h1>
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

Actuators.propTypes = {
  admin: PropTypes.bool.isRequired,
  deleteActuator: PropTypes.func.isRequired,
  devices: PropTypes.shape({
    devices: PropTypes.array,
    loaded: PropTypes.number,
    total: PropTypes.number
  }).isRequired,
  getActuators: PropTypes.func.isRequired,
  getDevices: PropTypes.func.isRequired,
  orchestrator: PropTypes.shape({
    name: PropTypes.string
  }).isRequired,
  siteTitle: PropTypes.string.isRequired
};

const mapStateToProps = state => ({
  siteTitle: state.Util.site_title,
  orchestrator: {
    name: state.Util.name || 'N/A'
  },
  admin: state.Auth.access.admin,
  devices: {
    devices: state.Device.devices,
    loaded: state.Device.devices.length,
    total: state.Device.count
  }
});

const mapDispatchToProps = (dispatch) => ({
  getActuators: (page, sizePerPage, sort) => dispatch(ActuatorActions.getActuators(page, sizePerPage, sort)),
  deleteActuator: (act) => dispatch(ActuatorActions.deleteActuator(act)),
  getDevices: (page, sizePerPage, sort) => dispatch(DeviceActions.getDevices(page, sizePerPage, sort))
});

export default connect(mapStateToProps, mapDispatchToProps)(Actuators);
