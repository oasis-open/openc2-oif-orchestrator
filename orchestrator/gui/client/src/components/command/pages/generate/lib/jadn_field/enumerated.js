import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
    FormGroup,
    FormText,
    Label,
    Input
} from 'reactstrap';

import { isOptional_jadn } from './'

import * as GenActions from '../../../../../../actions/generate'

class EnumeratedField extends Component {
    render() {
        let name = this.props.name || this.props.def.name
        let msgName = (this.props.parent ? [this.props.parent, name] : [name]).join('.')
        let def_opts = this.props.def.fields.map(opt => <option key={ opt[0] } data-subtext={ opt[2] }>{ opt[1] }</option>)

        return (
            <FormGroup tag="fieldset" className="border border-dark p-2">
                <legend>{ (isOptional_jadn(this.props.def) ? '' : '*') + name }</legend>
                { this.props.def.desc != '' ? <FormText color="muted">{ this.props.def.desc }</FormText> : '' }
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
