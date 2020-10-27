import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormText, Input } from 'reactstrap';

import Field from '.';
import { isOptionalJSON } from './utils';


class ChoiceField extends Component {
  constructor(props, context) {
    super(props, context);
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      selected: ''
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

  handleChange(e) {
    this.setState({
      selected: e.target.value
    }, () => {
      const { def, optChange } = this.props;
      const { selected } = this.state;

      if (selected === -1) {
       optChange(def[1], undefined);
      }
    });
  }

  render() {
    const { def, name, optChange } = this.props;
    const { selected } = this.state;

    const defOpts = [];
    if ('properties' in def) {
      Object.keys(def.properties).forEach(field => {
        const d = def.properties[field];
        defOpts.push(<option key={ field } data-subtext={ d.desc || '' } value={ field }>{ field }</option>);
      });
    }

    if ('patternProperties' in def) {
      // TODO: Pattern Properties
      console.warn('Choice Pattern Props', def.patternProperties);
    }

    let selectedDef = '';
    if (selected) {
      selectedDef = (
        <Field
          name={ selected }
          parent={ this.getParent() }
          def={ def.properties[selected] || {} }
          required
          optChange={ optChange }
        />
      );
    }

    return (
      <FormGroup tag="fieldset" className="border border-dark p-2">
        <legend>{ (isOptionalJSON(def) ? '' : '*') + name }</legend>
        { def.description ? <FormText color="muted">{ def.description }</FormText> : '' }
        <div className="col-12 my-1 px-0">
          <Input type="select" name={ name } title={ name } className="selectpicker" onChange={ this.handleChange } default={ -1 }>
            <option data-subtext={ `${name} options` } value="" >{ `${name} options` }</option>
            { defOpts }
          </Input>

          <div className="col-12 py-2">
            { selectedDef }
          </div>
        </div>
      </FormGroup>
    );
  }
}


ChoiceField.propTypes = {
  def: PropTypes.shape({
    name: PropTypes.string,
    type: PropTypes.string,
    description: PropTypes.string,
    properties: PropTypes.object,
    patternProperties: PropTypes.object
  }).isRequired,
  optChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  parent: PropTypes.string
};

ChoiceField.defaultProps = {
  name: 'ChoiceField',
  parent: ''
};

export default ChoiceField;
