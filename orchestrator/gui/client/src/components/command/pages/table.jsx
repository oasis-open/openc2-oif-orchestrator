import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { RemotePageTable, iso2local } from '../../utils';

import * as CommandActions from '../../../actions/command';

class CommandTable extends Component {
  constructor(props, context) {
    super(props, context);

    this.tableColumns = [
      {
        text: 'Command ID',
        dataField: 'command_id',
        sort: true
      },
      {
        text: 'Received',
        dataField: 'received_on',
        formatter: cell => <span>{ iso2local(cell) }</span>,
        sort: true
      },
      {
        text: 'Status',
        dataField: 'status',
        sort: true
      },
      {
        text: 'Command',
        dataField: 'command',
        formatter: cell => <span>{ `${cell.action} - ${Object.keys(cell.target || {})[0] || ''}` }</span>
      }
    ];

    this.defaultSort = [
      {
        dataField: 'received_on',
        order: 'asc'
      }
    ];

    const { cmdInfo } = this.props;
    this.editOptions = {
      info: cmdInfo
    };

  }

  render() {
    const { getCommands } = this.props;

    return (
      <RemotePageTable
        keyField='command_id'
        dataKey='Command.commands'
        dataGet={ getCommands }
        columns={ this.tableColumns }
        defaultSort={ this.defaultSort }
        editRows
        editOptions={ this.editOptions }
      />
    );
  }
}

CommandTable.propTypes = {
  getCommands: PropTypes.func.isRequired,
  cmdInfo: PropTypes.func
};

CommandTable.defaultProps = {
  cmdInfo: null
};

const mapDispatchToProps = dispatch => ({
  getCommands: (page, sizePerPage, sort) => dispatch(CommandActions.getCommands(page, sizePerPage, sort))
});

export default connect(null, mapDispatchToProps)(CommandTable);
