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
    isOptional_jadn,
    keys,
    zip,
    Field
} from './'

import * as GenActions from '../../../../../../actions/generate'


class RecordField extends Component {
    render() {
        let name = this.props.name || this.props.def.name
        let msgName = (this.props.parent ? [this.props.parent, name] : [name]).join('.')

        let fields = this.props.def.fields.map((field, i) => {
            return <Field key={ i } def={ zip(keys.Gen_Def, field) } parent={ msgName } optChange={ this.props.optChange } />
        })

        return (
            <FormGroup tag="fieldset" className="border border-dark p-2">
                <legend>{ (isOptional_jadn(this.props.def) ? '' : '*') + name }</legend>
                { this.props.def.desc != '' ? <FormText color="muted">{ this.props.def.desc }</FormText> : '' }
                <div className="col-12 my-1 px-0">
                    { fields }
                </div>
            </FormGroup>
        )
    }
}

const mapStateToProps = (state) => ({
    schema: state.Generate.selectedSchema
})

export default connect(mapStateToProps)(RecordField)
