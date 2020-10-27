import React from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup, FormFeedback, Input, Label
} from 'reactstrap';

const InputField = props => {
  const {
    name, label, type, error, onChange
  } = props;
  const id = `id_${name}`;

  return (
    <FormGroup color={ error ? 'danger' : '' }>
      {label ? <Label htmlFor={ id }>{ label }</Label> : ''}
      <Input
        type={ type }
        name={ name }
        id={ id }
        className={ error ? 'is-invalid' : '' }
        onChange={ onChange }
      />

      { error ? <FormFeedback className="invalid-feedback">{ error }</FormFeedback> : '' }
    </FormGroup>
  );
};

InputField.defaultProps = {
  name: 'input',
  label: null,
  type: 'text',
  error: null,
  onChange: () => {}
};

InputField.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  type: PropTypes.string,
  error: PropTypes.string,
  onChange: PropTypes.func
};

export default InputField;