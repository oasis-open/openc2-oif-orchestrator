import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormText, Input } from 'reactstrap';

const EnumeratedField = props => {
  const {
    def, name, optChange, parent, required
  } = props;

  const getParent = () => {
    let rtn = '';
    if (parent) {
      rtn = [parent, name].join('.');
    } else if (/^[a-z]/.exec(name)) {
      rtn = name;
    }
    return rtn;
  };

  const change = val => {
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
    optChange(getParent(), v);
  };

  let defOpts = [];

  if ('enum' in def) {
    if ('options' in def) {
      defOpts = def.options.map(opt => (
        <option key={ opt.value } value={ opt.value } data-subtext={ opt.description }>{ opt.label }</option>
      ));
    } else {
      defOpts = def.enum.map(opt => (
        <option key={ opt } value={ opt } data-subtext={ opt }>{ opt }</option>
      ));
    }
  } else if ('oneOf' in def) {
    defOpts = def.oneOf.map(opt => (
      <option key={ opt.const } value={ opt.const } data-subtext={ opt.description }>{ opt.const }</option>
    ));
  } else {
    defOpts = [<option key={ 0 } value="">Unknown Enumerated format</option>];
  }

  return (
    <FormGroup tag="fieldset" className="border border-dark p-2">
      <legend>{ (required ? '*' : '') + name }</legend>
      { def.description ? <FormText color="muted">{ def.description }</FormText> : '' }
      <Input
        type="select"
        name={ name }
        title={ name }
        className="selectpicker"
        onChange={ e => change(e.target.value) }
      >
        <option data-subtext={ `${name} options` } value='' >{ `${name} options` }</option>
        { defOpts }
      </Input>
    </FormGroup>
  );
};

EnumeratedField.propTypes = {
  def: PropTypes.shape({
    name: PropTypes.string,
    type: PropTypes.string,
    description: PropTypes.string,
    oneOf: PropTypes.arrayOf(PropTypes.shape({
      const: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      description: PropTypes.string
    })),
    options: PropTypes.arrayOf(PropTypes.shape({
      description: PropTypes.string,
      label: PropTypes.string,
      value: PropTypes.string
    })),
    enum: PropTypes.arrayOf(PropTypes.oneOf([
      PropTypes.string,
      PropTypes.number
    ]))
  }).isRequired,
  optChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  required: PropTypes.bool,
  parent: PropTypes.string
};

EnumeratedField.defaultProps = {
  name: 'EnumeratedField',
  required: false,
  parent: ''
};

export default EnumeratedField;
