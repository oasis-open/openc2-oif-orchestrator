import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormText, Input } from 'reactstrap';

import Field from '.';

const BasicFieldTypes = [
  'boolean',
  'integer',
  'number',
  'string'
];

const BasicField = props => {
  const {
    def, name, optChange, parent, required
  } = props;

  const fieldName = name || def.name;
  const msgName = (parent ? [parent, fieldName] : [fieldName]).join('.');

  const change = val => {
    const { arr } = props;
    let v = val;
    switch (def.type) {
      case 'integer':
        v = parseInt(val, 10) || null;
        break;
      case 'number':
        v = parseFloat(val.replace(',', '.')) || null;
        break;
      // no default
    }
    optChange(msgName, v, arr);
  };

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const inputOpts = (type, format) => {
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
  };

  if (BasicFieldTypes.includes(def.type)) { // name is type if not field
    const opts = inputOpts(def.type, def.format);
    return (
      <FormGroup tag="fieldset" className="border border-dark p-2">
        <legend>{ `${required ? '*' : ''}${fieldName}` }</legend>
        <Input
          { ...opts }
          name={ name }
          onChange={ e => change(e.target.value) }
        />
        { def.description ? <FormText color="muted">{ def.description }</FormText> : '' }
      </FormGroup>
    );
  }
  return (
    <Field
      name={ fieldName }
      parent={ parent }
      def={ def }
      optChange={ optChange }
    />
  );
};

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
