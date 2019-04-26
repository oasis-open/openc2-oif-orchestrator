import React, { Component } from 'react'
import { connect } from 'react-redux'
import { confirmAlert } from 'react-confirm-alert'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from 'react-bootstrap-table2-paginator'
import { Button } from 'reactstrap'

import 'react-confirm-alert/src/react-confirm-alert.css'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'

import {
    getMultiKey,
    setMultiKey
} from './'

const str_fmt = require('string-format')


const RemotePagination = ({ keyField, columns, data, page, pageSize, totalSize, defaultSort, onTableChange }) => {
    const pagination = paginationFactory({
        page: page,
        sizePerPage: pageSize,
        totalSize: totalSize,
        hidePageListOnlyOnePage: true,
        showTotal: true,
        paginationTotalRenderer: (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total ml-3">
                Showing { from } to { to } of { size } Results
            </span>
        ),
        withFirstAndLast: false,
    })

    if (defaultSort.length == 0 || defaultSort == null) {
        defaultSort = [{
            dataField: keyField, // if dataField is not match to any column defined, it will be ignored.
            order: 'desc' // desc or asc
        }]
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
    )
}

class RemotePageTable extends Component {
    constructor(props, context) {
        super(props, context)
        this.handleTableChange = this.handleTableChange.bind(this)
        this.editable = this.props.editRows == true
        this.keyField = this.props.keyField || 'id'

        let columns = this.props.columns || []

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
            })
        }

        this.state = {
            page: 1,
            pageSize: 10,
            total: 0,
            columns: columns,
            sort: 'name',
            displayData: (this.props.data || []).slice(0, 10)
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        let props_update = this.props != nextProps
        let state_update = this.state != nextState

        if (props_update) {
            this.setState((state, props) => {
                let startIndex = (state.page - 1) * state.pageSize
                let endIndex = startIndex + state.pageSize

                return {
                    total: nextProps.total,
                    displayData: this.editData(nextProps.data.sort(this.dynamicSort(this.state.sort)).slice(startIndex, endIndex))
                }
            })
        }

        return props_update || state_update
    }

    dynamicSort(property) {
        let sortOrder = 1

        if (property[0] === "-") {
            sortOrder = -1
            property = property.substr(1)
        }
        return (a, b) => ((a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0) * sortOrder
    }

    tablePagination(page, sizePerPage, currentSize) {
        let startIndex = (page - 1) * sizePerPage
        let endIndex = startIndex + sizePerPage
        let minRows = startIndex + 1

        if ((this.props.data.length < minRows || currentSize < sizePerPage) && this.props.total != this.props.data.length) {
            this.props.dataGet(page, sizePerPage, this.state.sort)
        }

        this.setState((state, props) => ({
            page: page,
            displayData: this.editData(this.props.data.sort(this.dynamicSort(this.state.sort)).slice(startIndex, endIndex)),
            pageSize: sizePerPage
        }))
    }

    tableSort(column, order) {
        let sort = (order == 'desc' ? '' : '-') + column

        this.setState((state, props) => {
            this.props.dataGet(state.page, state.pageSize, sort)
            let startIndex = (state.page - 1) * state.pageSize
            let endIndex = startIndex + state.pageSize

            return {
                sort: sort,
                displayData: this.editData(this.props.data.sort(this.dynamicSort(sort)).slice(startIndex, endIndex))
            }
        })
    }

    handleTableChange(type, args) {
        switch(type) {
            case 'filter':
                break;
            case 'pagination':
                this.tablePagination(args.page, args.sizePerPage, args.data.length)
                break;
            case 'sort':
                this.tableSort(args.sortField, args.sortOrder)
                break;
            case 'cellEdit':
                break;
            default:
                break;
        }
    }

    editData(data) {
        return this.editable ? data.map(d => { return { ...d, options: 'options'}}) : data
    }

    deleteData(delFun, key) {
        confirmAlert({
            title: 'Confirm Delete',
            childrenElement: () => (
                <div>
                    <p>{ str_fmt('Are you sure to delete: {key}?', {key: key}) }</p>
                    {
                        this.props.dataKey.match(/^[Dd]evice/) ? (
                            <p>This will also remove actuators associated with this device</p>
                        ): ''
                    }
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
        })
    }

    optionsFormatter(cell, row) {
        let i = 1
        let rtn = []

        if (Object.keys(this.options).length == 0) {
            rtn.push(<p key={ i++ } >Options not configured</p>)
        } else {
            if (this.options.modal) {
                rtn.push(<this.options.modal key={ i++ } data={ row } />)
            }

            if (this.options.navigate) {
                rtn.push(<Button key={ i++ } color='primary' size='sm' onClick={ () => this.options.navigate('/' + row[this.keyField]) }>{ cell }</Button>)
            }

            if (this.options.info) {
                rtn.push(<Button key={ i++ } color='info' size='sm' onClick={ () => this.options.info(row[this.keyField]) }>Info</Button>)
            }

            if (this.options.delete) {
                rtn.push(<Button key={ i++ } color='danger' size='sm' onClick={ () => this.deleteConfirm(this.options.delete, row[this.keyField]) }>Delete</Button>)
            }
        }

        return (<div>{ rtn }</div>)
    }

    render() {
        return (
            <RemotePagination
                keyField={ this.keyField }
                columns={ this.state.columns }
                data={ this.state.displayData }
                page={ this.state.page }
                pageSize={ this.state.pageSize }
                totalSize={ this.props.total }
                defaultSort={ this.props.defaultSort || [] }
                onTableChange={ this.handleTableChange }
            />
        )
    }
}

const mapStateToProps = (state, props) => ({
    data: getMultiKey(state, props.dataKey) || [],
    total: getMultiKey(state, [props.dataKey.split('.')[0], 'count'].join('.')) || 0
})

export default connect(mapStateToProps)(RemotePageTable)