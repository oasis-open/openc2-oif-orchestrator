import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { safeGet, RemotePageTable, iso2local } from '../../utils';
import * as ActuatorActions from '../../../actions/actuator';
import * as ConformanceActions from '../../../actions/conformance';
import * as DeviceActions from '../../../actions/device';

class ConformanceTable extends Component {
  constructor(props, context) {
    super(props, context);

    this.tableColumns = [
      {
        text: 'Test ID',
        dataField: 'test_id',
        sort: true
      },
      {
        text: 'Tested Actuator',
        dataField: 'actuator_tested',
        formatter: cell => <span>{ cell.name }</span>,
        sort: true
      },
      {
        text: 'Run at',
        dataField: 'test_time',
        formatter: cell => <span>{ iso2local(cell) }</span>,
        sort: true
      }
    ];

    this.editOptions = {
      info: this.props.confInfo
    };

  }

  render() {
    return (
      <RemotePageTable
        keyField='test_id'
        dataKey='Conformance.conformanceTests'
        dataGet={ this.props.getConformanceTests }
        columns={ this.tableColumns }
        defaultSort={[
          {
            dataField: 'test_time',
            order: 'asc'
          }
        ]}
        editRows
        editOptions={ this.editOptions }
      />
    );
  }
}

ConformanceTable.propTypes = {
  actuators: PropTypes.exact({
    actuators: PropTypes.array,
    loaded: PropTypes.number,
    total: PropTypes.number
  }).isRequired,
  devices: PropTypes.exact({
    devices: PropTypes.array,
    loaded: PropTypes.number,
    total: PropTypes.number
  }).isRequired,
  getConformanceTests: PropTypes.func.isRequired,
  confInfo: PropTypes.func
};

ConformanceTable.defaultProps = {
  confInfo: null
};

const mapStateToProps = state => ({
  actuators: {
    actuators: state.Actuator.actuators,
    loaded: state.Actuator.actuators.length,
    total: state.Actuator.count
  },
  devices: {
    devices: state.Device.devices,
    loaded: state.Device.devices.length,
    total: state.Device.count
  }
});

const mapDispatchToProps = dispatch => ({
  getConformanceTests: (page, sizePerPage, sort) => dispatch(ConformanceActions.getConformanceTests(page, sizePerPage, sort))
});

export default connect(mapStateToProps, mapDispatchToProps)(ConformanceTable);
