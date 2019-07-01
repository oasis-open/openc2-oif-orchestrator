import React, { Component } from 'react'
import { connect } from 'react-redux'
import DocumentMeta from 'react-document-meta'

import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
} from 'reactstrap'

import {
    DeviceModal
} from './lib'

import {
    RemotePageTable
} from '../utils'

import * as DeviceActions from '../../actions/device'

const str_fmt = require('string-format')

class Devices extends Component {
    constructor(props, context) {
        super(props, context)

        this.meta = {
            title: str_fmt('{base} | {page}', {base: this.props.siteTitle, page: 'Devices'}),
            canonical: str_fmt('{origin}{path}', {origin: window.location.origin, path: window.location.pathname})
        }

        this.tableColumns = [
            {
                text: 'Name',
                dataField: 'name',
                sort: true
            }, {
                text: 'Transport',
                dataField: 'transport',
                formatter: (cell) => ( <span>{ cell.map(t => str_fmt('{serialization} via {protocol}', t)).join(' | ') }</span> ),
                sort: true
            }
        ]

        this.editOptions = {
            modal: DeviceModal,
            delete: this.props.deleteDevice
        }
        // this.props.getDevices()
    }

    render() {
        return (
            <DocumentMeta { ...this.meta } extend >
                <div className="row mx-auto">
                    <div className="col-12">
                         <div className="col-12">
                            { this.props.admin ? <DeviceModal register className="float-right" /> : '' }
                            <h1>{ this.props.orchestrator.name } Devices</h1>
                        </div>

                        <RemotePageTable
                            keyField='device_id'
                            dataKey='Device.devices'
                            dataGet={ this.props.getDevices }
                            columns={ this.tableColumns }
                            editRows
                            editOptions={ this.editOptions }
                            defaultSort={[
                                {
                                    dataField: 'name',
                                    order: 'desc'
                                },
                                {
                                    dataField: 'transport',
                                    order: 'desc'
                                }
                            ]}
                        />
                    </div>
                </div>
            </DocumentMeta>
        )
    }
}

const mapStateToProps = (state) => ({
    siteTitle: state.Util.site_title,
    orchestrator: {
        name: state.Util.name || 'N/A'
    },
    admin: state.Auth.access.admin
})


const mapDispatchToProps = (dispatch) => ({
    getDevices: (page, sizePerPage, sort) => dispatch(DeviceActions.getDevices(page, sizePerPage, sort)),
    deleteDevice: (dev) => dispatch(DeviceActions.deleteDevice(dev))
})

export default connect(mapStateToProps, mapDispatchToProps)(Devices)
