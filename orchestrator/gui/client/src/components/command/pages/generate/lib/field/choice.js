import React, { Component } from 'react'
import { connect } from 'react-redux'

import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

import { Field, isOptional } from './'

import * as GenActions from '../../../../../../actions/generate'


class ChoiceField extends Component {
    constructor(props, context) {
        super(props, context)

        this.state = {
            selected: -1,
            selectedBase: ''
        }

        this.handleChange = this.handleChange.bind(this)
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
        let name = this.props.def[1]
        let args = this.props.def[3]
        let comment = this.props.def[4]

        let msgName = (this.props.parent ? [this.props.parent, name] : [name]).join('.')

        let typeDef = this.props.schema.types.filter(t => t[0] == this.props.def[2])
        typeDef = typeDef.length === 1 ? typeDef[0] : []

        let def_opts = typeDef[typeDef.length-1].map(opt => <option key={ opt[0] } data-subtext={ opt[2] } value={ opt[0] }>{ opt[1] }</option>)

        this.selectedDef = typeDef[typeDef.length-1].filter(opt => opt[0] == this.state.selected )
        this.selectedDef = this.selectedDef.length === 1 ? this.selectedDef[0] : []

        return (
            <FormGroup tag="fieldset" className="border border-dark p-2">
                <legend>{ (isOptional(this.props.def) ? '' : '*') + name }</legend>
                { comment != '' ? <FormText color="muted">{ comment }</FormText> : '' }
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

function mapStateToProps(state) {
    return {
        schema: state.Generate.selectedSchema
    }
}


function mapDispatchToProps(dispatch) {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChoiceField)
