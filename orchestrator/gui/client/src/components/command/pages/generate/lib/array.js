import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { Button, FormGroup, FormText } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

import Field from '.';
import { isOptionalJSON } from './utils';
import { objectValues, safeGet } from '../../../../utils';


class ArrayField extends Component {
  constructor(props, context) {
    super(props, context);
    this.parent = this.props.name;
    if (this.props.parent) {
      this.parent = [this.props.parent, this.props.name].join('.');
    } else if (this.props.name.match(/^[a-z]/)) {
      this.parent = this.props.name;
    }

    this.msgName = (this.props.parent ? [this.props.parent, this.props.name] : [this.props.name]).join('.');

    this.opts = {
      min: this.props.def.minItems || 0,
      max: this.props.def.maxItems || 100
    };

    this.state = {
      min: false,
      max: false,
      count: 1,
      opts: {}
    };
  }

  addOpt(e) {
    e.preventDefault();
    const max = this.opts.max;

    this.setState((prevState) => {
      const maxBool = prevState.count < max;
      return {
        count: maxBool ? prevState.count+1 : prevState.count,
        max: !maxBool
      };
    }, () => {
      this.props.optChange(this.parent, [ ...new Set(objectValues(this.state.opts)) ]);
      if (this.state.max) {
        const toastNode = (
          <div>
            <p>Warning:</p>
            <p>Cannot have more than { this.opts.max } items for { this.props.name }</p>
          </div>
        );
        toast(toastNode, {type: toast.TYPE.WARNING});
      }
    });
  }

  removeOpt(e) {
    e.preventDefault();
    const min = this.opts.min;

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
      this.props.optChange(this.parent, [ ...new Set(objectValues(this.state.opts)) ]);
      if (this.state.min) {
        const toastNode = (
          <div>
            <p>Warning:</p>
            <p>Cannot have less than { this.opts.min } items for { this.props.name }</p>
          </div>
        );
        toast(toastNode, {type: toast.TYPE.WARNING});
      }
    });
  }

  optChange(k, v, i) {
    this.setState((prevState) => {
      return {
        opts: {
          ...prevState.opts,
          [i]: v
        }
      };
    }, () => {
      this.props.optChange(this.parent, [ ...new Set(objectValues(this.state.opts)) ]);
    });
  }

  render() {
    this.desc = safeGet(this.props.def, 'description', '');
    const fields = [];

    for (let i=0; i < this.state.count; ++i) {
      if (Array.isArray(this.props.def.items)) {
        fields.push(this.props.def.items.map(field => {
          const name = '$ref' in field ? field.$ref.replace(/^#\/definitions\//, '') : '';
          return (
            <Field
              key={ i }
              name={ name }
              idx={ i }
              parent={ this.parent }
              def={ field }
              optChange={ this.optChange.bind(this) }
            />
          );
        }));
      } else {
        let name = 'Field';
        let ref = {};

        if ('$ref' in this.props.def.items) {
          name = this.props.def.items.$ref.replace(/^#\/definitions\//, '');
          ref = safeGet(safeGet(this.props.schema, 'definitions', {}), name, {});
        } else if ('type' in this.props.def.items) {
          ref = { ...this.props.def.items };
        }
        fields.push(
          <Field
            key={ i }
            name={ name }
            idx={ i }
            parent={ this.parent }
            def={ ref }
            optChange={ this.optChange.bind(this) }
          />
        );
      }
    }

    return (
      <FormGroup tag="fieldset" className="border border-dark p-2">
        <legend>
          { (isOptionalJSON(this.props.def.req, this.props.name) ? '' : '*') + this.props.name }
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
        { this.desc ? <FormText color="muted">{ this.desc }</FormText> : '' }
        { fields }
      </FormGroup>
    );
  }
}

ArrayField.propTypes = {
  def: PropTypes.shape({
    items: PropTypes.object.isRequired,
    minItems: PropTypes.number,
    maxItems: PropTypes.number,
    req: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  optChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  parent: PropTypes.string,
  schema: PropTypes.object
};

ArrayField.defaultProps = {
  name: '',
  parent: '',
  schema: {}
};

const mapStateToProps = state => ({
  schema: state.Generate.selectedSchema
});


export default connect(mapStateToProps)(ArrayField);
