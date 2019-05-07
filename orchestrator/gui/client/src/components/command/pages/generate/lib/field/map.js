import React, { Component } from 'react'
import { connect } from 'react-redux'

import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

import { Field, isOptional } from './'

import * as GenActions from '../../../../../../actions/generate'


class MapField extends Component {
    render() {
        let name = this.props.def[1]
        let args = this.props.def[3]
        let comment = this.props.def[4]

        let typeDef = this.props.schema.types.filter(t => t[0] == this.props.def[2])
        typeDef = typeDef.length === 1 ? typeDef[0] : []

        let msgName = (this.props.parent ? [this.props.parent, name] : [name]).join('.')

        return (
            <FormGroup tag="fieldset" className="border border-dark p-2">
                <legend>{ (isOptional(this.props.def) ? '' : '*') + name }</legend>
                { comment != '' ? <FormText color="muted">{ comment }</FormText> : '' }
                <div className="col-12 my-1 px-0">
                    {
                        typeDef[typeDef.length - 1].map((def, i) => <Field key={ i } def={ def } parent={ msgName } optChange={ this.props.optChange } />)
                    }
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

export default connect(mapStateToProps, mapDispatchToProps)(MapField)
