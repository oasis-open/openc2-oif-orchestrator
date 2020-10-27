import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button, Collapse, FormGroup, FormText
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

import Field from '.';
import { isOptionalJSON } from './utils';


class MapField extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      open: false
    };
  }

  getParent() {
    const { name, parent } = this.props;

    let rtn = '';
    if (parent) {
      rtn = [parent, name].join('.');
    } else if (/^[a-z]/.exec(name)) {
      rtn = name;
    }
    return rtn;
  }

  render() {
    const {
      def, name, optChange, required
    } = this.props;
    const { open } = this.state;

    let defOpts = [];
    if ('properties' in def) {
      defOpts = Object.keys(def.properties).map(field => (
        <Field
          key={ field }
          parent={ this.getParent() }
          name={ field }
          def={ def.properties[field] }
          required={ isOptionalJSON(def.required, field) }
          optChange={ optChange }
        />
      ));
    }

    if ('patternProperties' in def) {
      // TODO: Pattern Properties
      console.warn('Map Pattern Props', def.patternProperties);
    }

    return (
      <FormGroup tag="fieldset" className="border border-dark p-2">
        <legend>
          <Button
            color={ open ? 'primary' : 'info' }
            className='float-right p-1'
            onClick={ () => this.setState(prevState => ({ open: !prevState.open })) }
          >
            <FontAwesomeIcon icon={ open ? faMinusSquare : faPlusSquare } size="lg" />
          </Button>
          { (required ? '*' : '') + name }
        </legend>
        { def.description !== '' ? <FormText color="muted">{ def.description }</FormText> : '' }
        <Collapse isOpen={ open }>
          <div className="col-12 my-1 px-0">
            { defOpts }
          </div>
        </Collapse>
      </FormGroup>
    );
  }
}

MapField.propTypes = {
  def: PropTypes.shape({
    name: PropTypes.string,
    type: PropTypes.string,
    required: PropTypes.bool,
    description: PropTypes.string,
    properties: PropTypes.object,
    patternProperties: PropTypes.object
  }).isRequired,
  optChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  required: PropTypes.bool,
  parent: PropTypes.string
};

MapField.defaultProps = {
  name: 'MapField',
  required: false,
  parent: ''
};

export default MapField;
