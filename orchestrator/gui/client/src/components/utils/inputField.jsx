import React from 'react';
import {
  FormGroup,
  FormFeedback,
  Input,
  Label
} from 'reactstrap';

export default args => {
  const name = args.name || 'input';
  const label = args.label || null;
  const inputType = args.type || 'text';
  const error = args.error || null;
  const change = () => {};
  const onChange = args.onChange || change;
  const id = `id_${name}`;

  return (
    <FormGroup color={ error ? 'danger' : '' }>
      {label ? <Label htmlFor={ id }>{ label }</Label> : ''}
      <Input
        type={ inputType }
        name={ name }
        id={ id }
        className={ error ? 'is-invalid' : '' }
        onChange={ onChange }
      />

      { error ? <FormFeedback className="invalid-feedback">{ error }</FormFeedback> : '' }
    </FormGroup>
  );
};
