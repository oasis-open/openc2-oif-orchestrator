import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Collapse,
  FormGroup,
  FormText
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

import Field from '.';
import { isOptionalJSON } from './utils';


class RecordField extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      open: false
    };
  }

  render() {
    let parent = '';
    if (this.props.parent) {
      parent = [this.props.parent, this.props.name].join('.');
    } else if (this.props.name.match(/^[a-z]/)) {
      parent = this.props.name;
    }

    const defOpts = Object.keys(this.props.def.properties).map((field, i) => (
      <Field
        key={ i }
        parent={ parent }
        name={ field }
        def={ this.props.def.properties[field] }
        required={ isOptionalJSON(this.props.def.required, field) }
        optChange={ this.props.optChange }
      />
    ));

    if (this.props.root) {
      return defOpts;
    }
    return (
      <FormGroup tag="fieldset" className="border border-dark p-2">
        <legend>
          <Button
            color={ this.state.open ? 'primary' : 'info' }
            className='float-right p-1'
            onClick={ () => this.setState(prevState => ({ open: !prevState.open })) }
          >
            <FontAwesomeIcon icon={ this.state.open ? faMinusSquare : faPlusSquare } size="lg" />
          </Button>
          { (this.props.required ? '*' : '') + this.props.name }
        </legend>
        { this.props.def.description ? <FormText color="muted">{ this.props.def.description }</FormText> : '' }
        <Collapse isOpen={ this.state.open }>
          <div className="col-12 my-1 px-0">
            { defOpts }
          </div>
        </Collapse>
      </FormGroup>
    );
  }
}

RecordField.propTypes = {
  def: PropTypes.shape({
    name: PropTypes.string,
    type: PropTypes.string,
    required: PropTypes.arrayOf(PropTypes.string),
    description: PropTypes.string,
    properties: PropTypes.object
  }).isRequired,
  optChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  required: PropTypes.bool,
  root: PropTypes.bool,
  parent: PropTypes.string
};

RecordField.defaultProps = {
  name: 'RecordField',
  required: false,
  root: false,
  parent: ''
};

export default RecordField;
