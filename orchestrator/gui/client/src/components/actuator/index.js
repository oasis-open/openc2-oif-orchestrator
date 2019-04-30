import React, { Component } from 'react'
import { connect } from 'react-redux'
import DocumentMeta from 'react-document-meta'

import { ActuatorModal } from './lib'

import { RemotePageTable } from '../utils'

import * as ActuatorActions from '../../actions/actuator'
import * as DeviceActions from '../../actions/device'

const str_fmt = require('string-format')

class Actuators extends Component {
    constructor(props, context) {
        super(props, context)
        this.getDevice = this.getDevice.bind(this)

         this.meta = {
            title: str_fmt('{base} | {page}', {base: this.props.siteTitle, page: 'Actuators'}),
            canonical: str_fmt('{origin}{path}', {origin: window.location.origin, path: window.location.pathname})
        }

        this.tableColumns = [
            {
                text: 'Name',
                dataField: 'name',
                sort: true
            },{
                text: 'Device',
                dataField: 'device',
                sort: true,
                formatter: (cell, row) => ( <span>{ this.getDevice(cell) }</span> )
            },{
                text: 'Profile',
                dataField: 'profile',
                sort: true,
                formatter: (cell, row) => <span>{ cell.replace(/_/g, ' ') }</span>
            }
        ]

        this.editOptions = {
            modal: ActuatorModal,
            delete: this.props.deleteActuator
        }

        if (this.props.devices.loaded === 0) {
            this.props.getDevices()
        }

        this.props.getActuators()
    }

    getDevice(id) {
        let device = this.props.devices.devices.filter(d => d.device_id == id)
        device = device.length == 1 ? device[0] : {}
        return device.name || id
    }

    render() {
        setTimeout(() => {
            if (this.props.devices.loaded !== this.props.devices.total) {
                this.props.getDevices(1, this.props.devices.total)
            }
        }, 10)

        return (
            <DocumentMeta { ...this.meta } extend >
                <div className="row mx-auto">
                    <div className="col-12">
                        <div className="col-12">
                            { this.props.admin ? <ActuatorModal register className="float-right" /> : '' }
                            <h1>{ this.props.orchestrator.name } Actuators</h1>
                        </div>

                        <RemotePageTable
                            keyField='actuator_id'
                            dataKey='Actuator.actuators'
                            dataGet={ this.props.getActuators }
                            columns={ this.tableColumns }
                            editRows
                            editOptions={ this.editOptions }
                            defaultSort={[
                                {
                                    dataField: 'name',
                                    order: 'desc'
                                },{
                                    dataField: 'profile',
                                    order: 'desc'
                                },{
                                    dataField: 'device',
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
    admin: state.Auth.access.admin,
    devices: {
        devices: state.Device.devices,
        loaded: state.Device.devices.length,
        total: state.Device.count
    }
})

const mapDispatchToProps = (dispatch) => ({
    getActuators: (page, sizePerPage, sort) => dispatch(ActuatorActions.getActuators(page, sizePerPage, sort)),
    deleteActuator: (act) => dispatch(ActuatorActions.deleteActuator(act)),
    getDevices: (page, sizePerPage, sort) => dispatch(DeviceActions.getDevices(page, sizePerPage, sort))
})

export default connect(mapStateToProps, mapDispatchToProps)(Actuators)
