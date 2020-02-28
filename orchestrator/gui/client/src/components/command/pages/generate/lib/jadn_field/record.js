import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormText } from 'reactstrap';

import Field from '.';
import { isOptionalJADN, JADN_KEYS, zip } from '../utils';


const RecordField = props => {
  const name = props.name || props.def.name;
  const msgName = (props.parent ? [props.parent, name] : [name]).join('.');
  const fields = props.def.fields.map(field => (
    <Field key={ field[0] } def={ zip(JADN_KEYS.Gen_Def, field) } parent={ msgName } optChange={ props.optChange } />
  ));

  return (
    <FormGroup tag="fieldset" className="border border-dark p-2">
      <legend>{ (isOptionalJADN(props.def) ? '' : '*') + name }</legend>
      { props.def.desc !== '' ? <FormText color="muted">{ props.def.desc }</FormText> : '' }
      <div className="col-12 my-1 px-0">
        { fields }
      </div>
    </FormGroup>
  );
};

RecordField.propTypes = {
  def: PropTypes.object,
  name: PropTypes.string,
  optChange: PropTypes.func,
  parent: PropTypes.string
};

RecordField.defaultProps = {
  def: {},
  name: '',
  optChange: null,
  parent: ''
};

export default RecordField;
