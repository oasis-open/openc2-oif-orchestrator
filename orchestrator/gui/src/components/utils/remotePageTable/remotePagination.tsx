import React, { FunctionComponent } from 'react';
import BootstrapTable, {
  ColumnDescription, SortOrder, TableChangeHandler, TableChangeState, TableChangeType
} from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-confirm-alert/src/react-confirm-alert.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

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
  defaultSort: [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onTableChange: (_type: TableChangeType, _newState: TableChangeState<any>) => {}
};

const RemotePagination: FunctionComponent<RemotePaginationProps> = (props) => {
  const {
    keyField, columns, data, page, pageSize, totalSize, defaultSort, onTableChange
  } = props;

  const pagination = paginationFactory({
    page,
    sizePerPage: pageSize,
    totalSize,
    hidePageListOnlyOnePage: true,
    showTotal: true,
    // eslint-disable-next-line react/no-unstable-nested-components
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
    <div className='p-0'>
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
    </div>
  );
};

RemotePagination.defaultProps = DefaultProps;

export default RemotePagination;