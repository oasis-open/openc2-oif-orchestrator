import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormText, Input } from 'reactstrap';

import Field from '.';
import { isOptionalJADN, JADN_KEYS, zip } from '../utils';


class ChoiceField extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleChange = this.handleChange.bind(this);

    this.state = {
      selected: -1
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
    const name = this.props.name || this.props.def.name;
    const msgName = (this.props.parent ? [this.props.parent, name] : [name]).join('.');
    const defOpts = this.props.def.fields.map(opt => (
      <option key={ opt[0] } data-subtext={ opt[2] } value={ opt[0] }>{ opt[1] }</option>
    ));

    this.selectedDef = this.props.def.fields.filter(opt => opt[0] === this.state.selected);
    this.selectedDef = this.selectedDef.length === 1 ? zip(JADN_KEYS.Gen_Def, this.selectedDef[0]) : {};

    return (
      <FormGroup tag="fieldset" className="border border-dark p-2">
        <legend>{ (isOptionalJADN(this.props.def) ? '' : '*') + name }</legend>
        { this.props.def.desc !== '' ? <FormText color="muted">{ this.props.def.desc }</FormText> : '' }
        <div className="col-12 my-1 px-0">
          <Input
            className="selectpicker"
            type="select"
            name={ name }
            title={ name }
            default={ -1 }
            onChange={ this.handleChange }
          >
            <option data-subtext={ `${name} options` } value={ -1 }>{ name } options</option>
            { defOpts }
          </Input>

          <div className="col-12 py-2">
            { this.state.selected >= 0 ? <Field def={ this.selectedDef } parent={ msgName } optChange={ this.props.optChange } /> : '' }
          </div>
        </div>
      </FormGroup>
    );
  }
}

ChoiceField.propTypes = {
  def: PropTypes.object,
  name: PropTypes.string,
  optChange: PropTypes.func,
  parent: PropTypes.string
};

ChoiceField.defaultProps = {
  def: {},
  name: '',
  optChange: null,
  parent: ''
};

export default ChoiceField;
