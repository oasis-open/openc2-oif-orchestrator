import React, { FunctionComponent } from 'react';
import { Dispatch } from 'redux';
import { ConnectedProps, connect } from 'react-redux';
import { RemotePageTable, iso2local } from '../../utils';
import { Actuator, Conformance } from 'actions';

// Interfaces
interface ConformanceTableProps {
  confInfo?: (test: string) => void
}

// Redux Connector
const mapDispatchToProps = (dispatch: Dispatch) => ({
  getConformanceTests: (page: number, count: number, sort: string) => dispatch(Conformance.getConformanceTests({page, count, sort}))
});

const connector = connect(undefined, mapDispatchToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type ConformanceTableConnectedProps = ConformanceTableProps & ConnectorProps;

// Component
const ConformanceTable: FunctionComponent<ConformanceTableConnectedProps> = props => {
  const { confInfo, getConformanceTests } = props;
  const tableColumns = [
    {
      text: 'Test ID',
      dataField: 'test_id',
      sort: true
    },
    {
      text: 'Tested Actuator',
      dataField: 'actuator_tested',
      formatter: (cell: Actuator.Actuator) => <span>{ cell.name }</span>,
      sort: true
    },
    {
      text: 'Run at',
      dataField: 'test_time',
      formatter: (cell: string) => <span>{ iso2local(cell) }</span>,
      sort: true
    }
  ];

  const editOptions = {
    info: confInfo
  };

  return (
    <RemotePageTable
      keyField='test_id'
      dataKey='Conformance.conformanceTests'
      dataGet={ getConformanceTests }
      columns={ tableColumns }
      defaultSort={
        [{
          dataField: 'test_time',
          order: 'asc'
        }]
      }
      editRows
      editOptions={ editOptions }
    />
  );
};

export default connector(ConformanceTable);
