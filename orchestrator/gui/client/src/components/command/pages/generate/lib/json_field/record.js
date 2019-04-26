import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
    Button,
    Form,
    FormGroup,
    FormText,
    Input,
    Label,
} from 'reactstrap'

import {
    isOptional_json,
    Field
} from './'

import * as GenActions from '../../../../../../actions/generate'


class RecordField extends Component {
    render() {
        let msgName = (this.props.parent ? [this.props.parent, this.props.name] : [this.props.name]).join('.')

        let def_opts = []
        Object.keys(this.props.def.properties).map((field, i) => {
            let fieldArgs = {
                key: i,
                name: field,
                def: this.props.def.properties[field],
                required: isOptional_json(this.props.def.required, field),
                parent: this.props.parent ? msgName : "",
                optChange: this.props.optChange
            }
            def_opts.push(<Field { ...fieldArgs } />)
        })

        if (this.props.parent) {
            return (
                <FormGroup tag="fieldset" className="border border-dark p-2">
                    <legend>{ (this.props.required ? '*' : '') + this.props.name }</legend>
                    { this.props.def.description ? <FormText color="muted">{ this.props.def.description }</FormText> : '' }
                    <div className="col-12 my-1 px-0">
                        { def_opts }
                    </div>
                </FormGroup>
            )
        } else {
            return def_opts
        }
    }
}

const mapStateToProps = (state) => ({
    schema: state.Generate.selectedSchema
})

export default connect(mapStateToProps)(RecordField)
