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


class ChoiceField extends Component {
    constructor(props, context) {
        super(props, context)

        this.handleChange = this.handleChange.bind(this)

        this.state = {
            selected: -1,
            selectedBase: ''
        }
    }

    handleChange(e) {
        this.setState({
            selected: e.target.value
        }, () => {
            if (this.state.selected == -1) {
               this.props.optChange(this.props.def[1], undefined)
            }
        })
    }

    render() {
        let name = this.props.name || this.props.def.name
        let msgName = (this.props.parent ? [this.props.parent, name] : [name]).join('.')
        let def_opts = this.props.def.fields.map(opt => <option key={ opt[0] } data-subtext={ opt[2] } value={ opt[0] }>{ opt[1] }</option>)

        this.selectedDef = this.props.def.fields.filter(opt => opt[0] == this.state.selected)
        this.selectedDef = this.selectedDef.length === 1 ? zip(keys.Gen_Def, this.selectedDef[0]) : {}

        return (
            <FormGroup tag="fieldset" className="border border-dark p-2">
                <legend>{ (isOptional_jadn(this.props.def) ? '' : '*') + name }</legend>
                { this.props.def.desc != '' ? <FormText color="muted">{ this.props.def.desc }</FormText> : '' }
                <div className="col-12 my-1 px-0">
                    <Input type="select" name={ name } title={ name } className="selectpicker" onChange={ this.handleChange } default={ -1 }>
                        <option data-subtext={ name + ' options' } value={ -1 }>{ name } options</option>
                        { def_opts }
                    </Input>

                    <div className="col-12 py-2">
                        {
                            this.state.selected >= 0 ? <Field def={ this.selectedDef } parent={ msgName } optChange={ this.props.optChange } /> : ''
                        }
                    </div>
                </div>
            </FormGroup>
        )
    }
}

const mapStateToProps = (state) => ({
    schema: state.Generate.selectedSchema
})

export default connect(mapStateToProps)(ChoiceField)
