import React, { FunctionComponent } from 'react';
import BootstrapTable, {
  ColumnDescription, SortOrder, TableChangeHandler, TableChangeState, TableChangeType
} from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-confirm-alert/src/react-confirm-alert.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

// Interfaces
type Sort = { dataField: string; order: SortOrder; }

interface RemotePaginationProps {
  keyField: string;
  columns: Array<ColumnDescription>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Array<any>;
  page: number;
  pageSize: number;
  totalSize: number;
  defaultSort?: [Sort] | Array<Sort>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onTableChange?: TableChangeHandler<any>;
}

// Component
const DefaultProps = {
  columns: [],
  page: 0,
  pageSize: 10,
  totalSize: 0,
  defaultSort: [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onTableChange: (_type: TableChangeType, _newState: TableChangeState<any>) => {}
};

const RemotePagination: FunctionComponent<RemotePaginationProps> = (props) => {
  const {
    keyField, columns, data, page, pageSize, totalSize, defaultSort, onTableChange
  } = { ...DefaultProps, ...props };

  const pagination = paginationFactory({
    page,
    sizePerPage: pageSize,
    totalSize,
    hidePageListOnlyOnePage: true,
    showTotal: true,
    paginationTotalRenderer: (from, to, size) => (
      <span className="react-bootstrap-table-pagination-total ml-3">{ `Showing ${from} to ${to} of ${size} Results` }</span>
    ),
    withFirstAndLast: false
  });

  let defSort: [Sort] = [{
    dataField: keyField, // if dataField is not match to any column defined, it will be ignored.
    order: 'desc'
  }];
  if (defaultSort && defaultSort.length === 1) {
    defSort = [defaultSort[0]];
  }

  return (
    <BootstrapTable
      remote
      hover
      striped
      condensed
      bootstrap4
      keyField={ keyField }
      columns={ columns }
      data={ data }
      pagination={ pagination }
      onTableChange={ onTableChange }
      defaultSorted={ defSort }
      defaultSortDirection='desc'
    />
  );
};

export default RemotePagination;