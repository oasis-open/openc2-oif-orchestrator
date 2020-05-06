import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormText, Input } from 'reactstrap';

class EnumeratedField extends Component {
  change(val) {
    let v = val;
    switch (this.props.def.type) {
      case 'integer':
        v = parseInt(val, 10) || null;
        break;
      case 'number':
        v = parseFloat(val.replace(',', '.')) || null;
        break;
      // no default
    }
    this.props.optChange(this.parent, v);
  }

  render() {
    this.parent = '';
    if (this.props.parent) {
      this.parent = [this.props.parent, this.props.name].join('.');
    } else if (this.props.name.match(/^[a-z]/)) {
      this.parent = this.props.name;
    }

    let defOpts = [];

    if ('enum' in this.props.def) {
      if ('options' in this.props.def) {
        defOpts = this.props.def.options.map(opt => (
          <option key={ opt.value } value={ opt.value } data-subtext={ opt.description }>{ opt.label }</option>
        ));
      } else {
        defOpts = this.props.def.enum.map(opt => (
          <option key={ opt } value={ opt } data-subtext={ opt }>{ opt }</option>
        ));
      }
    } else if ('oneOf' in this.props.def) {
        defOpts = this.props.def.oneOf.map(opt => (
          <option key={ opt.const } value={ opt.const } data-subtext={ opt.description }>{ opt.const }</option>
        ));
    } else {
      defOpts = [<option key={ 0 } value="">Unknown Enumerated format</option>];
    }

    return (
      <FormGroup tag="fieldset" className="border border-dark p-2">
        <legend>{ (this.props.required ? '*' : '') } { this.props.name }</legend>
        { this.props.def.description ? <FormText color="muted">{ this.props.def.description }</FormText> : '' }
        <Input
          type="select"
          name={ this.props.name }
          title={ this.props.name }
          className="selectpicker"
          onChange={ e => this.change(e.target.value) }
        >
          <option data-subtext={ `${this.props.name} options` } value='' >{ `${this.props.name} options` }</option>
          { defOpts }
        </Input>
      </FormGroup>
    );
  }
}

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
