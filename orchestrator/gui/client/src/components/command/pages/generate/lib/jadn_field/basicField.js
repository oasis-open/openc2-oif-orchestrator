import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormText, Input } from 'reactstrap';

import Field from '.';
import { isOptionalJADN } from '../utils';


const BasicField = props => {
  const inputOpts = type => {
    switch (type) {
      case 'duration':
        return {
          type: 'number',
          placeholder: 0
        };
      case 'date-time':
        return {
          type: 'datetime',
          placeholder: '2000-01-01T00:00:00-00:00'
        };
      default:
        return {
          type: 'text'
        };
    }
  };

  const name = props.name || props.def.name;
  const msgName = (props.parent ? [props.parent, name] : [name]).join('.');

  if (props.def.name >= 0) { // name is type if not field
    return <Field def={ props.def } parent={ msgName } optChange={ props.optChange } />;
  }
  const opts = inputOpts(props.def.type);

  return (
    <FormGroup tag="fieldset" className="border border-dark p-2">
      <legend>{ (isOptionalJADN(props.def) ? '' : '*') + name }</legend>
      <Input
        type={ opts.type || 'text' }
        placeholder={ opts.placeholder || '' }
        name={ name }
        onChange={ e => props.optChange(msgName, e.target.value, props.arr) }
      />
      { props.def.desc ? <FormText color="muted">{ props.def.desc }</FormText> : '' }
    </FormGroup>
  );
};

BasicField.propTypes = {
  arr: PropTypes.bool,
  def: PropTypes.object,
  name: PropTypes.string,
  optChange: PropTypes.func,
  parent: PropTypes.string
};

BasicField.defaultProps = {
  arr: false,
  def: {},
  name: '',
  optChange: null,
  parent: ''
};

export default BasicField;
