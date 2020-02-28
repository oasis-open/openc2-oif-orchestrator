import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormText, Input } from 'reactstrap';

import { isOptionalJADN } from '../utils';

const EnumeratedField = props =>  {
  const name = props.name || props.def.name;
  const msgName = (props.parent ? [props.parent, name] : [name]).join('.');
  const defOpts = props.def.fields.map(opt => <option key={ opt[0] } data-subtext={ opt[2] }>{ opt[1] }</option>);

  return (
    <FormGroup tag="fieldset" className="border border-dark p-2">
      <legend>{ (isOptionalJADN(props.def) ? '' : '*') + name }</legend>
      { props.def.desc !== '' ? <FormText color="muted">{ props.def.desc }</FormText> : '' }
      <Input
        type="select"
        name={ name }
        title={ name }
        className="selectpicker"
        onChange={ e => props.optChange(msgName, e.target.value) }
      >
        <option data-subtext={ `${name} options` } value='' >{ `${name} options` }</option>
        { defOpts }
      </Input>
    </FormGroup>
  );
};

EnumeratedField.propTypes = {
  def: PropTypes.object,
  name: PropTypes.string,
  optChange: PropTypes.func,
  parent: PropTypes.string
};

EnumeratedField.defaultProps = {
  def: {},
  name: '',
  optChange: null,
  parent: ''
};

export default EnumeratedField;
