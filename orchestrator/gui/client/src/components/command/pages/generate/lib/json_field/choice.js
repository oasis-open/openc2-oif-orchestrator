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


class ChoiceField extends Component {
    constructor(props, context) {
        super(props, context)

        this.handleChange = this.handleChange.bind(this)

        this.state = {
            selected: ""
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

        let def_opts = Object.keys(this.props.def.oneOf[0].properties).map((field, i) => {
            let def = this.props.def.oneOf[0].properties[field]
            return <option key={ i } data-subtext={ def.desc || "" } value={ field }>{ field }</option>
        })

        let selectedDef = ""
        if (this.state.selected) {
            selectedDef = <Field
                name={ this.state.selected }
                parent={ msgName }
                def={ this.props.def.oneOf[0].properties[this.state.selected] || {} }
                required
                optChange={ this.props.optChange }
            />
        }

        return (
            <FormGroup tag="fieldset" className="border border-dark p-2">
                <legend>{ (isOptional_json(this.props.def) ? '' : '*') + name }</legend>
                { this.props.def.description ? <FormText color="muted">{ this.props.def.description }</FormText> : '' }
                <div className="col-12 my-1 px-0">
                    <Input type="select" name={ name } title={ name } className="selectpicker" onChange={ this.handleChange } default={ -1 }>
                        <option data-subtext={ name + ' options' } value={ "" }>{ name } options</option>
                        { def_opts }
                    </Input>

                    <div className="col-12 py-2">
                        { selectedDef }
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
