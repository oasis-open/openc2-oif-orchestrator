import React, { Component } from 'react';
import { ConnectedProps, connect, ConnectedComponent } from 'react-redux';
import { RSAAResultAction } from 'redux-api-middleware';
import {
  ColumnDescription, SortOrder, TableChangeState, TableChangeType
} from 'react-bootstrap-table-next';
import { confirmAlert } from 'react-confirm-alert';
import { Button, Modal } from 'reactstrap';

import 'react-confirm-alert/src/react-confirm-alert.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import RemotePagination from './remotePagination';
import { getMultiKey } from '../multiKey';

// Interfaces
export interface RowEditOptions {
  modal?: ConnectedComponent<typeof Modal, Record<string, any>>;
  navigate?: (url: string) => void;
  info?: (id: string) => void;
  delete?: (
    ((id: number) => Promise<RSAAResultAction<unknown, unknown>>) |
    ((id: string) => Promise<RSAAResultAction<unknown, unknown>>)
  );
}

export interface ColumnDescriptionKeyed extends ColumnDescription {
  keyField?: string;
  navigate?: (url: string) => void;
  deleteConfirm?: (f: () => void, k: string) => void;
  options?: RowEditOptions;
}

interface Data {
  [key: string]: number|string
}

interface RemotePageTableProps {
  keyField: string;
  dataKey: string;
  columns: Array<ColumnDescriptionKeyed>;
  defaultSort: Array<{
    dataField: string
    order: SortOrder
  }>;
  editRows: boolean;
  editOptions?: RowEditOptions;
  dataGet: (page: number, count: number, sort: string) => void;
  navigate?: (url: string) => void;
}

interface RemotePageTableState {
  page: number;
  pageSize: number;
  columns: Array<ColumnDescriptionKeyed>;
  sort: string;
}

// Redux Connector
interface RootState {  // TODO: convert state to TypeScript
  [store: string]: {
    sort: string;
    count: number;
    errors: Record<string, any>;
  } & ( { actuators: Array<any>; } | { decices: Array<any>; } )
}

const mapStateToProps = (state: RootState, props: RemotePageTableProps) => ({
  data: getMultiKey<Array<Data>>(state, props.dataKey) || [],
  total: getMultiKey<number>(state, [props.dataKey.split('.')[0], 'count'].join('.')) || 0
});

const connector = connect(mapStateToProps, {});
type ConnectorProps = ConnectedProps<typeof connector>;
type RemotePageTableConnectedProps = RemotePageTableProps & ConnectorProps;

// Component
class RemotePageTable extends Component<RemotePageTableConnectedProps, RemotePageTableState> {
  // Component Vars
  editable: boolean;
  keyField: string;
  // filler typing, not actually used; from columns
  // eslint-disable-next-line react/sort-comp, @typescript-eslint/no-unused-vars
  deleteConfirm = (_f: (key: any) => void, _k: string) => {};
  options?: {
    modal?: ({key, data}: {key: number, data: Data}) => JSX.Element;
    info?: (data: Data) => void;
    delete?: (key: string) => void;
    navigate?: (url: string) => void;
  }

  constructor(props: RemotePageTableConnectedProps) {
    super(props);
    this.deleteData = this.deleteData.bind(this);
    this.handleTableChange = this.handleTableChange.bind(this);

    const {
      columns, data, dataGet, editOptions, editRows, keyField, navigate
    } = this.props;

    this.editable = editRows === true;
    this.keyField = keyField || 'id';
    const tableColumns = columns || [];

    if (this.editable) {
      tableColumns.push({
        text: 'Options',
        dataField: 'options',
        isDummyField: true,
        keyField: this.keyField,
        navigate,
        formatter: this.optionsFormatter,
        deleteConfirm: this.deleteData,
        options: editOptions
      });
    }

    this.state = {
      page: 1,
      pageSize: 10,
      columns: tableColumns,
      sort: 'name'
    };

    const { page, pageSize, sort } = this.state;

    if (data.length === 0) {
      dataGet(page, pageSize, sort);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  dynamicSort(property: string) {
    let sortOrder = 1;
    if (property[0] === '-') {
      sortOrder = -1;
      // eslint-disable-next-line no-param-reassign
      property = property.substr(1);
    }
    return (a: Record<string, any>, b: Record<string, any>) => {
      let v = 0;
      if (a[property] < b[property]) {
        v = -1;
      } else if (a[property] > b[property]) {
        v = 1;
      }
      return v * sortOrder;
    };
  }

  tablePagination(page: number, sizePerPage: number, currentSize: number) {
    const { data, dataGet, total } = this.props;
    const { sort } = this.state;

    const startIndex = (page - 1) * sizePerPage;
    const minRows = startIndex + 1;

    if ((data.length < minRows || currentSize < sizePerPage) && total !== data.length) {
      dataGet(page, sizePerPage, sort);
    }

    this.setState({
      page,
      pageSize: sizePerPage
    });
  }

  tableSort(column: string, order: SortOrder) {
    this.setState({
      sort: (order === 'desc' ? '' : '-') + column
    });
  }

  handleTableChange<T>(type: TableChangeType, newState: TableChangeState<T>) {
    switch (type) {
      case 'filter':
        break;
      case 'pagination':
        this.tablePagination(newState.page, newState.sizePerPage, newState.data.length);
        break;
      case 'sort':
        this.tableSort(newState.sortField, newState.sortOrder);
        break;
      case 'cellEdit':
        break;
      default:
        break;
    }
  }

  editData(data: Array<Data>) {
    return this.editable ? data.map(d => { return { ...d, options: 'options'};}) : data;
  }

  deleteData(delFun: (k: string) => void, key: string) {
    const { dataKey } = this.props;
    confirmAlert({
      title: 'Confirm Delete',
      childrenElement: () => (
        <div>
          <p>{ `Are you sure to delete: ${key}?` }</p>
          { dataKey.match(/^[Dd]evice/) ? <p>This will also remove actuators associated with this device</p> : '' }
        </div>
      ),
      buttons: [
        {
          label: 'Delete',
          onClick: () => delFun(key)
        },
        {
          label: 'Cancel',
          onClick: () => {}
        }
      ]
    });
  }

  optionsFormatter(cell: string, row: Data) {
    const rtn = [];
    let i = 0;
    if (this.options) {
      const { info, navigate } = this.options;
      const optDelete = this.options.delete;
      const OptModal = this.options.modal;
      if (Object.keys(this.options).length === 0) {
        i+=1;
        rtn.push(<p key={ i } >Options not configured</p>);
      } else {
        if (OptModal) {
          i+=1;
          rtn.push(<OptModal key={ i } data={ row } />);
        }

        if (navigate) {
          i+=1;
          rtn.push(<Button key={ i } color='primary' size='sm' onClick={ () => navigate(`/${row[this.keyField]}`) }>{ cell }</Button>);
        }

        if (info) {
          i+=1;
          rtn.push(<Button key={ i } color='info' size='sm' onClick={ () => info(row[this.keyField]) }>Info</Button>);
        }

        if (optDelete) {
          i+=1;
          rtn.push(<Button key={ i } color='danger' size='sm' onClick={ () => this.deleteConfirm(optDelete, row[this.keyField]) }>Delete</Button>);
        }
      }
    }

    return (<div>{ rtn }</div>);
  }

  displayData() {
    const { data } = this.props;
    const { page, pageSize, sort } = this.state;

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return this.editData(data.sort(this.dynamicSort(sort)).slice(startIndex, endIndex));
  }

  render() {
    const { defaultSort, total } = this.props;
    const { columns, page, pageSize } = this.state;

    return (
      <RemotePagination
        keyField={ this.keyField }
        columns={ columns }
        data={ this.displayData() }
        page={ page }
        pageSize={ pageSize }
        totalSize={ total }
        defaultSort={ defaultSort }
        onTableChange={ this.handleTableChange }
      />
    );
  }
}

export default connector(RemotePageTable);
