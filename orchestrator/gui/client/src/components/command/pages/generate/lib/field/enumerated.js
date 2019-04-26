import React, { Component } from 'react'
import { connect } from 'react-redux'

import { FormGroup, Label, Input, FormText } from 'reactstrap';

import { isOptional } from './'

import * as GenActions from '../../../../../../actions/generate'

class EnumeratedField extends Component {
    constructor(props, context) {
        super(props, context)
    }

    render() {
        let name = this.props.def[1]
        let args = this.props.def[3]
        let comment = this.props.def[4]

        let msgName = (this.props.parent ? [this.props.parent, name] : [name]).join('.')

        let typeDef = this.props.schema.types.filter(t => t[0] == this.props.def[2] )
        typeDef = typeDef.length === 1 ? typeDef[0] : []

        let def_opts = typeDef[typeDef.length-1].map(opt => <option key={ opt[0] } data-subtext={ opt[2] }>{ opt[1] }</option>)

        return (
            <FormGroup tag="fieldset" className="border border-dark p-2">
                <legend>{ (isOptional(this.props.def) ? '' : '*') + name }</legend>
                { comment != '' ? <FormText color="muted">{ comment }</FormText> : '' }
                <Input
                    type="select"
                    name={ name }
                    title={ name }
                    className="selectpicker"
                    onChange={ e => this.props.optChange(msgName, e.target.value) }
                >
                    <option data-subtext={ name + ' options' } value='' >{ name + ' options' }</option>
                    { def_opts }
                </Input>
            </FormGroup>
        )
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

export default connect(mapStateToProps, mapDispatchToProps)(EnumeratedField)
