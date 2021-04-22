import React, { FunctionComponent } from 'react';
import { Dispatch } from 'redux';
import { ConnectedProps, connect } from 'react-redux';
import { SortOrder } from 'react-bootstrap-table-next';
import {
  ColumnDescriptionKeyed, RowEditOptions, RemotePageTable, iso2local
} from '../../utils';
import { Command } from '../../../actions';

// Interfaces
interface CommandTableProps {
  cmdInfo: (cmd: string) => void;
}

// Redux Connector
const mapDispatchToProps = (dispatch: Dispatch) => ({
  getCommands: (page: number, count: number, sort: string) => dispatch(Command.getCommands({page, count, sort}))
});

const connector = connect(null, mapDispatchToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type CommandTableConnectedProps = CommandTableProps & ConnectorProps;

// Component
const CommandTable: FunctionComponent<CommandTableConnectedProps> = props => {
  const { cmdInfo, getCommands } = props;
  const tableColumns: Array<ColumnDescriptionKeyed> = [
    {
      text: 'Command ID',
      dataField: 'command_id',
      sort: true
    },
    {
      text: 'Received',
      dataField: 'received_on',
      formatter: (cell: string) => <span>{ iso2local(cell) }</span>,
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
      formatter: (cell: Record<string, any> ) => {
        const { action, target } = cell;
        return <span>{ `${action} - ${Object.keys(target || {})[0] || ''}` }</span>;
      }
    }
  ];

  const defaultSort: Array<{dataField: string, order: SortOrder}> = [
    {
      dataField: 'received_on',
      order: 'asc'
    }
  ];

  const editOptions: RowEditOptions = {
    info: cmdInfo
  };

  return (
    <RemotePageTable
      keyField='command_id'
      dataKey='Command.commands'
      dataGet={ getCommands }
      columns={ tableColumns }
      defaultSort={ defaultSort }
      editRows
      editOptions={ editOptions }
    />
  );
};

export default connector(CommandTable);
