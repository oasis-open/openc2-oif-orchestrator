import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormText, Input } from 'reactstrap';

import Field from '.';

class BasicField extends Component {
  constructor(props, context) {
    super(props, context);

    this.BasicFieldTypes = [
      'boolean',
      'integer',
      'number',
      'string'
    ];
  }

  change(val) {
    let v = val;
    switch (this.props.def.type) {
      case 'integer':
        v = parseInt(val, 10) || null;
        break;
      case 'number':
        v = parseFloat(val.replace(',', '.')) || null;
        break;
      // no default
    }
    this.props.optChange(this.msgName, v, this.props.arr);
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars, @typescript-eslint/no-unused-vars
  inputOpts(type, format) {
    // TODO: use the JSON format??
    switch (type) {
      case 'number':
      case 'integer':
        return {
          type: 'number',
          placeholder: 0
        };
      case 'boolean':
        return {
          type: 'checkbox',
          style: {
            position: 'inherit',
            marginLeft: 0
          }
        };
      default:
        return {
          type: 'text'
        };
    }
  }

  render() {
    const name = this.props.name || this.props.def.name;
    this.msgName = (this.props.parent ? [this.props.parent, name] : [name]).join('.');

    if (this.BasicFieldTypes.indexOf(this.props.def.type) === -1) { // name is type if not field
      return (
        <Field
          name={ name }
          parent={ this.props.parent }
          def={ this.props.def }
          optChange={ this.props.optChange }
        />
      );
    }

    const opts = this.inputOpts(this.props.def.type, this.props.def.format);
    return (
      <FormGroup tag="fieldset" className="border border-dark p-2">
        <legend>{ (this.props.required ? '*' : '') + name }</legend>
        <Input
          { ...opts }
          name={ name }
          onChange={ e => this.change(e.target.value) }
        />
        { this.props.def.description ? <FormText color="muted">{ this.props.def.description }</FormText> : '' }
      </FormGroup>
    );
  }
}

BasicField.propTypes = {
  def: PropTypes.shape({
    name: PropTypes.string,
    type: PropTypes.string,
    description: PropTypes.string,
    format: PropTypes.string
  }).isRequired,
  optChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  arr: PropTypes.bool,
  required: PropTypes.bool,
  parent: PropTypes.string
};

BasicField.defaultProps = {
  name: 'BasicField',
  arr: false,
  required: false,
  parent: ''
};

export default BasicField;
