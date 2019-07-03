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



class BasicField extends Component {
    constructor(props, context) {
        super(props, context)

        this.BasicFieldTypes = [
            "boolean",
            "integer",
            "number",
            "string"
        ]
    }

    change(val) {
        let def_type = this.props.def.type
        switch(def_type) {
            case "integer":
                val = parseInt(val, 10) || null
                break;
            case "number":
                val = parseFloat(val.replace(",", ".")) || null
                break;
        }
        this.props.optChange(this.msgName, val, this.props.arr ? true : false)
    }

    inputOpts(type, format) {
        switch (type) {
            case 'number':
            case "integer":
			    return {
				    type: 'number',
					placeholder: 0,
				}

			default:
				return {
				    type: 'text'
			    }
		}
    }

    render() {
        let name = this.props.name || this.props.def.name
        this.msgName = (this.props.parent ? [this.props.parent, name] : [name]).join(".")

        if (this.BasicFieldTypes.indexOf(this.props.def.type) == -1) { // name is type if not field
            return <Field parent={ this.props.parent } name={ name } def={ this.props.def } optChange={ this.props.optChange } />
        } else {
            let opts = this.inputOpts(this.props.def.type, this.props.def.format)
            return (
                <FormGroup tag="fieldset" className="border border-dark p-2">
                    <legend>{ (this.props.required ? '*' : '') + name }</legend>
                    <Input
                        type={ opts.type || 'text' }
                        placeholder={ opts.placeholder || '' }
                        name={ name }
                        onChange={ e => this.change(e.target.value) }
                    />
                    { this.props.def.description ? <FormText color="muted">{ this.props.def.description }</FormText> : '' }
                </FormGroup>
            )
        }
    }
}

const mapStateToProps = (state) => ({
    schema: state.Generate.selectedSchema
})

export default connect(mapStateToProps)(BasicField)
