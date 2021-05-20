import React, { FunctionComponent } from 'react';
import classNames from 'classnames';
import {
  FormGroup, FormFeedback, Input, Label
} from 'reactstrap';
import { InputType } from 'reactstrap/es/Input';

interface InputFieldProps {
  name: string;
  label?: string;
  type?: InputType;
  error?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DefaultProps: InputFieldProps = {
  name: 'input',
  type: 'text',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange: (_e: React.ChangeEvent<HTMLInputElement>) => {}
};

const InputField: FunctionComponent<InputFieldProps> = (props=DefaultProps)  => {
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
        className={ classNames({ 'is-invalid': error }) }
        onChange={ onChange }
      />

      { error ? <FormFeedback className="invalid-feedback">{ error }</FormFeedback> : '' }
    </FormGroup>
  );
};

export default InputField;