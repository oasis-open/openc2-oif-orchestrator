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

  handleChange(e) {
    this.setState({
      selected: e.target.value
    }, () => {
      if (this.state.selected === -1) {
       this.props.optChange(this.props.def[1], undefined);
      }
    });
  }

  render() {
    let parent = '';
    if (this.props.parent) {
      parent = [this.props.parent, this.props.name].join('.');
    } else if (this.props.name.match(/^[a-z]/)) {
      parent = this.props.name;
    }

    const defOpts = [];
    if ('properties' in this.props.def) {
      Object.keys(this.props.def.properties).forEach(field => {
        const def = this.props.def.properties[field];
        defOpts.push(<option key={ field } data-subtext={ def.desc || '' } value={ field }>{ field }</option>);
      });
    }

    if ('patternProperties' in this.props.def) {
      // TODO: Pattern Properties
      console.log('Choice Pattern Props', this.props.def.patternProperties);
    }

    let selectedDef = '';
    if (this.state.selected) {
      selectedDef = <Field
        name={ this.state.selected }
        parent={ parent }
        def={ this.props.def.properties[this.state.selected] || {} }
        required
        optChange={ this.props.optChange }
      />;
    }

    return (
      <FormGroup tag="fieldset" className="border border-dark p-2">
        <legend>{ (isOptionalJSON(this.props.def) ? '' : '*') + this.props.name }</legend>
        { this.props.def.description ? <FormText color="muted">{ this.props.def.description }</FormText> : '' }
        <div className="col-12 my-1 px-0">
          <Input type="select" name={ this.props.name } title={ this.props.name } className="selectpicker" onChange={ this.handleChange } default={ -1 }>
            <option data-subtext={ `${this.props.name} options` } value="" >{ this.props.name } options</option>
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
