import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, FormGroup, FormText } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

import Field from '.';
import {
  isOptionalJADN,
  opts2arr,
  zip,
  JADN_KEYS,
  JADN_SCHEMA_PROPS
} from '../utils';


class ArrayOfField extends Component {
  constructor(props, context) {
    super(props, context);
    this.name = this.props.name || this.props.def.name;
    this.msgName = (this.props.parent ? [this.props.parent, this.name] : [this.name]).join('.');
    this.opts = opts2arr(this.props.def.opts);

    this.state = {
      min: false,
      max: false,
      count: 1,
      opts: {}
    };
  }

  addOpt(e) {
    e.preventDefault();
    const max = 'max' in this.opts ? this.opts.max : 20;

    this.setState((prevState) => {
      const maxBool = prevState.count < max;
      return {
        count: maxBool ? prevState.count+1 : prevState.count,
        max: !maxBool
      };
    }, () => {
      this.props.optChange(this.msgName, [ ...new Set(Object.values(this.state.opts)) ]);
    });
  }

  removeOpt(e) {
    e.preventDefault();
    const min = 'min' in this.opts ? this.opts.min : 0;

    this.setState(prevState => {
      const minBool = prevState.count > min;
      const opts = prevState.opts;
      if (minBool) {
        delete opts[Math.max(...Object.keys(opts))];
      }

      return {
        opts,
        count: minBool ? prevState.count-1 : prevState.count,
        min: !minBool
      };
    }, () => {
      this.props.optChange(this.msgName, [ ...new Set(Object.values(this.state.opts)) ]);
    });
  }

  optChange(k, v, i) {
    this.setState(prevState => {
      return {
        opts: {
          ...prevState.opts,
          [i]: v
        }
      };
    }, () => {
      this.props.optChange(this.msgName, [ ...new Set(Object.values(this.state.opts)) ]);
    });
  }

  render() {
    let arrDef = this.props.schema.types.filter((type) => type[0] === this.opts.rtype);

    if (arrDef.length === 1) {
      arrDef = arrDef[0];
      arrDef = [0, arrDef[0].toLowerCase(), arrDef[0], [], arrDef[arrDef.length-2]];
    } else {
      arrDef = [0, arrDef[1], 'String', [], ''];
    }
    arrDef = zip(JADN_KEYS.Gen_Def, arrDef);

    const fields = [];
    for (let i=0; i < this.state.count; ++i) {
      fields.push(<Field
        key={ i }
        def={ arrDef }
        idx={ i }
        parent={ this.msgName }
        optChange={ this.optChange.bind(this) }
      />);
    }

    return (
      <FormGroup tag="fieldset" className="border border-dark p-2">
        <legend>
          { (isOptionalJADN(this.props.def) ? '' : '*') + this.name }
          <Button
            color="danger"
            className={ `float-right p-1 ${this.state.min ? 'disabled' : ''}` }
            onClick={ this.removeOpt.bind(this) }
          >
            <FontAwesomeIcon icon={ faMinusSquare } size="lg"/>
          </Button>
          <Button
            color="primary"
            className={ `float-right p-1 ${this.state.max ? 'disabled' : ''}` }
            onClick={ this.addOpt.bind(this) }
          >
            <FontAwesomeIcon icon={ faPlusSquare } size="lg"/>
          </Button>
        </legend>
        { this.props.def.desc !== '' ? <FormText color="muted">{ this.props.def.desc }</FormText> : '' }
        { fields }
      </FormGroup>
    );
  }
}

ArrayOfField.propTypes = {
  def: PropTypes.object,
  name: PropTypes.string,
  optChange: PropTypes.func,
  parent: PropTypes.string,
  schema: JADN_SCHEMA_PROPS
};

ArrayOfField.defaultProps = {
  def: {},
  name: '',
  optChange: null,
  parent: '',
  schema: {}
};

const mapStateToProps = state => ({
  schema: state.Generate.selectedSchema
});

export default connect(mapStateToProps)(ArrayOfField);
