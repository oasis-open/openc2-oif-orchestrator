import React, { Component } from 'react'
import { connect } from 'react-redux'

import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

import { Field, isOptional } from './'

import * as GenActions from '../../../../../../actions/generate'


class BasicField extends Component {
    constructor(props, context) {
        super(props, context)
    }

    inputOpts(type) {
        switch (type) {
            case 'duration':
			    return {
				    type: 'number',
					placeholder: 0,
				}

			case 'date-time':
			    return {
					type: 'datetime',
					placeholder: '2000-01-01T00:00:00-00:00',
				}

			default:
				return {
				    type: 'text'
			    }
		}
    }

    render() {
        let name = this.props.def[1]
        let type = this.props.def[2]
        let args = this.props.def[3]
        let comment = this.props.def[4]

        let typeDef = this.props.schema.types.filter((type) => { return type[0] == type })
        typeDef = typeDef.length === 1 ? typeDef[0] : []

        let msgName = this.props.parent ? [this.props.parent, name] : [name]

        if (name >= 0) { // name is type if not field
            return <Field def={ this.props.def } parent={ msgName.join('.') } optChange={ this.props.optChange } />
        } else {
            let opts = this.inputOpts(type)

            return (
                <FormGroup tag="fieldset" className="border border-dark p-2">
                    <legend>{ (isOptional(this.props.def) ? '' : '*') + name }</legend>
                    <Input
                        type={ opts.type || 'text' }
                        placeholder={ opts.placeholder || '' }
                        name={ name }
                        onChange={ e => this.props.optChange(msgName.join('.'), e.target.value, this.props.arr ? true : false) }
                    />
                    { comment != '' ? <FormText color="muted">{ comment }</FormText> : '' }
                </FormGroup>
            )
        }
    }
}

function mapStateToProps(state) {
    return {
        schema: state.Generate.selectedSchema
    }
}


function mapDispatchToProps(dispatch) {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(BasicField)
