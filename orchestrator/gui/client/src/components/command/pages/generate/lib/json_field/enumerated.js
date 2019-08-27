import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
  FormGroup,
  FormText,
  Label,
  Input
} from 'reactstrap';

import * as GenActions from '../../../../../../actions/generate'

class EnumeratedField extends Component {
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
    this.props.optChange(this.msgName, val)
  }

  render() {
    let name = this.props.name || this.props.def.name
    this.msgName = (this.props.parent ? [this.props.parent, name] : [name]).join('.')

    let def_opts = []

    if (this.props.def.hasOwnProperty("enum")) {
      if (this.props.def.hasOwnProperty("options")) {
        def_opts = this.props.def.options.map((opt, i) => <option key={ i } value={ opt.value } data-subtext={ opt.description }>{ opt.label }</option>)
      } else {
        def_opts = this.props.def.enum.map(opt => <option key={ opt } value={ opt } data-subtext={ opt }>{ opt }</option>)
      }
    } else if (this.props.def.hasOwnProperty("oneOf")) {
        def_opts = this.props.def.oneOf.map((opt, i) => <option key={ i } value={ opt.const } data-subtext={ opt.description }>{ opt.const }</option>)
    } else {
      def_opts = [<option key={ 0 } value="">Unknown Enumerated format</option>]
    }

    return (
      <FormGroup tag="fieldset" className="border border-dark p-2">
        <legend>{ (this.props.required ? '*' : '') } { name }</legend>
        { this.props.def.description ? <FormText color="muted">{ this.props.def.description }</FormText> : '' }
        <Input
          type="select"
          name={ name }
          title={ name }
          className="selectpicker"
          onChange={ e => this.change(e.target.value) }
        >
          <option data-subtext={ name + ' options' } value='' >{ name + ' options' }</option>
          { def_opts }
        </Input>
      </FormGroup>
    )
  }
}

const mapStateToProps = (state) => ({
  schema: state.Generate.selectedSchema
})

export default connect(mapStateToProps)(EnumeratedField)
