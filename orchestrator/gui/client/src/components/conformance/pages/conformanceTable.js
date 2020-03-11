import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  RemotePageTable,
  iso2local
} from '../../utils';

import * as ConformanceActions from '../../../actions/conformance';

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
  getConformanceTests: PropTypes.func.isRequired,
  confInfo: PropTypes.func
};

ConformanceTable.defaultProps = {
  confInfo: null
};

const mapDispatchToProps = dispatch => ({
  getConformanceTests: (page, sizePerPage, sort) => dispatch(ConformanceActions.getConformanceTests(page, sizePerPage, sort))
});

export default connect(null, mapDispatchToProps)(ConformanceTable);
