import React, { Component } from 'react'
import { connect } from 'react-redux'
import DocumentMeta from 'react-document-meta'

import JSONPretty from 'react-json-pretty'

import {
    RemotePageTable
} from '../../utils'

import * as CommandActions from '../../../actions/command'

const str_fmt = require('string-format')

class CommandInfo extends Component {
    constructor(props, context) {
        super(props, context)

        this.tableColumns = [
            {
                text: 'Command ID',
                dataField: 'command_id',
                sort: true
            },{
                text: 'Received',
                dataField: 'received_on',
                sort: true
            },/*{
                text: 'Actuators',
                dataField: 'actuators',
                sort: true
            },{
                text: 'Responses',
                dataField: 'responses',
                sort: true
            },*/{
                text: 'Status',
                dataField: 'status',
                sort: true
            },{
                text: 'Command',
                dataField: 'command',
                formatter: (cell, row) => <span>{ cell.action }  - { Object.keys(cell.target)[0] || '' }</span>
            }
        ]

        if (this.props.command) {
            if (this.props.command.command_id !== this.props.command_id) {
                this.props.getCommand(this.props.command_id)
            }
        }
    }

    render() {
        let cmd = this.props.command
        let maxHeight = 500

        return (
            <div className="col-md-10 mx-auto jumbotron">
                <h2>Command Info</h2>
                <p><strong>Command ID:</strong> { cmd.command_id }</p>

                <p><strong>Received:</strong> { cmd.received_on }</p>

                <div>
                    <p><strong>Actuators:</strong></p>
                    <ul className="list-group">
                        { (cmd.actuators || []).map((act, i) => <li key={ i } className="list-group-item">{ act.name }: { act.serialization } via { act.protocol }</li>)}
                    </ul>
                </div>

                <div>
                    <p className="m-0"><strong>Command:</strong></p>
                    <div className='position-relative' style={{ maxHeight: maxHeight+'px' }}>
                        <JSONPretty
                            id='command'
                            className='scroll-xl border'
                            style={{ minHeight: 2.5+'em' }}
                            json={ cmd.command }
                        />
                    </div>
                </div>

                <div>
                    <p className="m-0"><strong>Responses:</strong></p>
                    <div className="p-1 border border-primary" style={{ maxHeight: maxHeight+'px' }}>
                        {
                            (cmd.responses || []).map((rsp, i) => {
                                return (
                                    <div key={ i }>
                                        <p className="m-0"><strong>{ rsp.actuator }:</strong></p>
                                        <div className='position-relative'>
                                            <JSONPretty
                                                id={ 'response-' + i }
                                                className='scroll-xl border'
                                                style={{ minHeight: 2.5+'em' }}
                                                json={ rsp.response }
                                            />
                                        </div>
                                    </div>
                                )
                            })
                        }

                        {/*
                        {% for resp in command.responses %}
                            <p class="m-0"><strong>{{ resp.actuator.name }}</strong></p>
                            <pre class="m-1 border code">{{ resp.response|jsonify|pretty_json }}</pre>
                        {% endfor %}
                        */}
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    let cmd = state.Command.commands.filter(c=> c.command_id === props.command_id)
    return {
        siteTitle: state.Util.site_title,
        orchestrator: {
            name: state.Util.name || 'N/A'
        },
        admin: state.Auth.access.admin,
        command: cmd.length == 1 ? cmd[0] : {}
    }
}


function mapDispatchToProps(dispatch) {
    return {
        getCommands: (page, sizePerPage, sort) => dispatch(CommandActions.getCommands(page, sizePerPage, sort)),
        getCommand: (cmd) => dispatch(CommandActions.getCommand(cmd)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CommandInfo)
