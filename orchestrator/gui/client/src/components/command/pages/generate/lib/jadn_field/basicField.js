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
  Field
} from './'

import * as GenActions from '../../../../../../actions/generate'


class BasicField extends Component {
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
    let name = this.props.name || this.props.def.name
    let msgName = (this.props.parent ? [this.props.parent, name] : [name]).join(".")

    if (this.props.def.name >= 0) { // name is type if not field
      return <Field def={ this.props.def } parent={ msgName } optChange={ this.props.optChange } />
    } else {
      let opts = this.inputOpts(this.props.def.type)

      return (
        <FormGroup tag="fieldset" className="border border-dark p-2">
          <legend>{ (isOptional_jadn(this.props.def) ? '' : '*') + name }</legend>
          <Input
            type={ opts.type || 'text' }
            placeholder={ opts.placeholder || '' }
            name={ name }
            onChange={ e => this.props.optChange(msgName, e.target.value, this.props.arr ? true : false) }
          />
          { this.props.def.desc ? <FormText color="muted">{ this.props.def.desc }</FormText> : '' }
        </FormGroup>
      )
    }
  }
}

const mapStateToProps = (state) => ({
  schema: state.Generate.selectedSchema
})

export default connect(mapStateToProps)(BasicField)
