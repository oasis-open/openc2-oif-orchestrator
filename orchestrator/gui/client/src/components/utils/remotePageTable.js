import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { confirmAlert } from 'react-confirm-alert';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Button } from 'reactstrap';

import 'react-confirm-alert/src/react-confirm-alert.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import { getMultiKey } from './multiKey';


const RemotePagination = ({ keyField, columns, data, page, pageSize, totalSize, defaultSort, onTableChange }) => {
  const pagination = paginationFactory({
    page,
    sizePerPage: pageSize,
    totalSize,
    hidePageListOnlyOnePage: true,
    showTotal: true,
    paginationTotalRenderer: (from, to, size) => (
      <span className="react-bootstrap-table-pagination-total ml-3">
        Showing { from } to { to } of { size } Results
      </span>
    ),
    withFirstAndLast: false
  });

  if (defaultSort.length === 0 || defaultSort === null) {
    // eslint-disable-next-line no-param-reassign
    defaultSort = [{
      dataField: keyField, // if dataField is not match to any column defined, it will be ignored.
      order: 'desc' // desc or asc
    }];
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
      defaultSorted={ defaultSort }
      defaultSortDirection='desc'
    />
  );
};

RemotePagination.propTypes = {
  keyField: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(PropTypes.object),
  data: PropTypes.array.isRequired,
  page: PropTypes.number,
  pageSize: PropTypes.number,
  totalSize: PropTypes.number,
  defaultSort: PropTypes.arrayOf(PropTypes.shape({
    dataField: PropTypes.string,
    order: PropTypes.oneOf(['asc', 'desc'])
  })),
  onTableChange: PropTypes.func
};

RemotePagination.defaultProps = {
  columns: [],
  page: 0,
  pageSize: 10,
  totalSize: 0,
  defaultSort: [],
  onTableChange: () => {}
};

class RemotePageTable extends Component {
  constructor(props, context) {
    super(props, context);
    this.handleTableChange = this.handleTableChange.bind(this);
    this.editable = this.props.editRows === true;
    this.keyField = this.props.keyField || 'id';
    const columns = this.props.columns || [];

    if (this.editable) {
      columns.push({
        text: 'Options',
        dataField: 'options',
        isDummyField: true,
        keyField: this.keyField,
        navigate: this.props.navigate,
        formatter: this.optionsFormatter,
        deleteConfirm: this.deleteData.bind(this),
        options: this.props.editOptions
      });
    }
    this.state = {
      page: 1,
      pageSize: 10,
      columns,
      sort: 'name'
    };

    if (this.props.data.length === 0) {
      this.props.dataGet({page: this.state.page, count: this.state.pageSize, sort: this.state.sort});
    }
  }

  // eslint-disable-next-line class-methods-use-this
  dynamicSort(property) {
    let sortOrder = 1;
    if (property[0] === '-') {
      sortOrder = -1;
      // eslint-disable-next-line no-param-reassign
      property = property.substr(1);
    }
    return (a, b) => {
      let v = 0;
      if (a[property] < b[property]) {
        v = -1;
      } else if (a[property] > b[property]) {
        v = 1;
      }
      return v * sortOrder;
    };
  }

  tablePagination(page, sizePerPage, currentSize) {
    const startIndex = (page - 1) * sizePerPage;
    const minRows = startIndex + 1;

    if ((this.props.data.length < minRows || currentSize < sizePerPage) && this.props.total !== this.props.data.length) {
      this.props.dataGet({page, count: sizePerPage, sort: this.state.sort});
    }

    this.setState({
      page,
      pageSize: sizePerPage
    });
  }

  tableSort(column, order) {
    this.setState({
      sort: (order === 'desc' ? '' : '-') + column
    });
  }

  handleTableChange(type, args) {
    switch (type) {
      case 'filter':
        break;
      case 'pagination':
        this.tablePagination(args.page, args.sizePerPage, args.data.length);
        break;
      case 'sort':
        this.tableSort(args.sortField, args.sortOrder);
        break;
      case 'cellEdit':
        break;
      default:
        break;
    }
  }

  editData(data) {
    return this.editable ? data.map(d => { return { ...d, options: 'options'};}) : data;
  }

  deleteData(delFun, key) {
    confirmAlert({
      title: 'Confirm Delete',
      childrenElement: () => (
        <div>
          <p>{ `Are you sure to delete: ${key}?` }</p>
          { this.props.dataKey.match(/^[Dd]evice/) ? <p>This will also remove actuators associated with this device</p> : '' }
        </div>
      ),
      buttons: [
        {
          label: 'Delete',
          onClick: () => delFun(key)
        }, {
          label: 'Cancel'
        }
      ]
    });
  }

  optionsFormatter(cell, row) {
    const rtn = [];
    let i = 0;

    if (Object.keys(this.options).length === 0) {
      i+=1;
      rtn.push(<p key={ i } >Options not configured</p>);
    } else {
      if (this.options.modal) {
        i+=1;
        rtn.push(<this.options.modal key={ i } data={ row } />);
      }

      if (this.options.navigate) {
        i+=1;
        rtn.push(<Button key={ i } color='primary' size='sm' onClick={ () => this.options.navigate(`/${row[this.keyField]}`) }>{ cell }</Button>);
      }

      if (this.options.info) {
        i+=1;
        rtn.push(<Button key={ i } color='info' size='sm' onClick={ () => this.options.info(row[this.keyField]) }>Info</Button>);
      }

      if (this.options.delete) {
        i+=1;
        rtn.push(<Button key={ i } color='danger' size='sm' onClick={ () => this.deleteConfirm(this.options.delete, row[this.keyField]) }>Delete</Button>);
      }
    }

    return (<div>{ rtn }</div>);
  }

  displayData() {
    const startIndex = (this.state.page - 1) * this.state.pageSize;
    const endIndex = startIndex + this.state.pageSize;
    return this.editData(this.props.data.sort(this.dynamicSort(this.state.sort)).slice(startIndex, endIndex));
  }

  render() {
    return (
      <RemotePagination
        keyField={ this.keyField }
        columns={ this.state.columns }
        data={ this.displayData() }
        page={ this.state.page }
        pageSize={ this.state.pageSize }
        totalSize={ this.props.total }
        defaultSort={ this.props.defaultSort || [] }
        onTableChange={ this.handleTableChange }
      />
    );
  }
}

RemotePageTable.propTypes = {
  keyField: PropTypes.string.isRequired,
  dataKey: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(PropTypes.object),
  data: PropTypes.array.isRequired,
  total: PropTypes.number.isRequired,
  defaultSort: PropTypes.arrayOf(PropTypes.shape({
    dataField: PropTypes.string,
    order: PropTypes.oneOf(['asc', 'desc'])
  })),
  editRows: PropTypes.bool,
  editOptions: PropTypes.shape({
    modal: PropTypes.elementType,
    navigate: PropTypes.func,
    info: PropTypes.func,
    delete: PropTypes.func
  }),
  dataGet: PropTypes.func.isRequired,
  navigate: PropTypes.func
};

RemotePageTable.defaultProps = {
  columns: [],
  defaultSort: [],
  editRows: true,
  editOptions: null,
  navigate: null
};

const mapStateToProps = (state, props) => ({
  data: getMultiKey(state, props.dataKey) || [],
  total: getMultiKey(state, [props.dataKey.split('.')[0], 'count'].join('.')) || 0
});

export default connect(mapStateToProps)(RemotePageTable);