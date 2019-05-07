import React, { Component } from 'react'
import { connect } from 'react-redux'
import DocumentMeta from 'react-document-meta'

import {
    RemotePageTable
} from '../../utils'

import * as CommandActions from '../../../actions/command'

const str_fmt = require('string-format')

class CommandTable extends Component {
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
                formatter: (cell, row) => <span>{ cell.action }  - { Object.keys(cell.target || {})[0] || '' }</span>
            }
        ]

        this.editOptions = {
            info: this.props.cmdInfo
        }

    }

    render() {
        return (
            <RemotePageTable
                keyField='command_id'
                dataKey='Command.commands'
                dataGet={ this.props.getCommands }
                columns={ this.tableColumns }
                defaultSort={[
                    {
                        dataField: 'received_on',
                        order: 'asc'
                    }
                ]}
                editRows
                editOptions={ this.editOptions }
            />
        )
    }
}

function mapStateToProps(state) {
    return {
        siteTitle: state.Util.site_title,
        orchestrator: {
            name: state.Util.name || 'N/A'
        },
        admin: state.Auth.access.admin
    }
}


function mapDispatchToProps(dispatch) {
    return {
        getCommands: (page, sizePerPage, sort) => dispatch(CommandActions.getCommands(page, sizePerPage, sort)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CommandTable)
