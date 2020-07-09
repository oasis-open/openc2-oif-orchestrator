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
    this.addOpt = this.addOpt.bind(this);
    this.optChange = this.optChange.bind(this);
    this.removeOpt = this.removeOpt.bind(this);

    const { def, name, parent } = this.props;

    this.parent = name;
    if (parent) {
      this.parent = [parent, name].join('.');
    } else if (/^[a-z]/.exec(name)) {
      this.parent = name;
    }

    this.msgName = (parent ? [parent, name] : [name]).join('.');

    this.opts = {
      min: def.minItems || 0,
      max: def.maxItems || 100
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
    const { max } = this.opts;

    this.setState(prevState => {
      const maxBool = prevState.count < max;
      return {
        count: maxBool ? prevState.count+1 : prevState.count,
        max: !maxBool
      };
    }, () => {
      const { name, optChange } = this.props;
      const { opts } = this.state;

      optChange(this.parent, [ ...new Set(objectValues(opts)) ]);
        toast(
          <div>
            <p>Warning:</p>
            <p>{ `Cannot have more than ${this.opts.max} items for ${name}` }</p>
          </div>,
          { type: toast.TYPE.WARNING }
        );
      }
    );
  }

  removeOpt(e) {
    e.preventDefault();

    this.setState(prevState => {
      const { min } = this.opts;
      const { count, opts } = prevState;
      const minBool = count > min;
      if (minBool) {
        delete opts[Math.max(...Object.keys(opts))];
      }

      return {
        opts,
        count: minBool ? count-1 : count,
        min: !minBool
      };
    }, () => {
      const { name, optChange } = this.props;
      const { min, opts } = this.state;

      optChange(this.parent, [ ...new Set(objectValues(opts)) ]);
      if (min) {
        toast(
          <div>
            <p>Warning:</p>
            <p>{ `Cannot have less than ${this.opts.min} items for ${name}` }</p>
          </div>,
          { type: toast.TYPE.WARNING }
        );
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
      const { optChange } = this.props;
      const { opts } = this.state;

      optChange(this.parent, [ ...new Set(objectValues(opts)) ]);
    });
  }

  render() {
    const { def, name, schema } = this.props;
    const { count, max, min } = this.state;

    this.desc = safeGet(def, 'description', '');
    const fields = [];

    for (let i=0; i < count; ++i) {
      if (Array.isArray(def.items)) {
        fields.push(def.items.map(field => {
          const fieldName = '$ref' in field ? field.$ref.replace(/^#\/definitions\//, '') : '';
          return (
            <Field
              key={ i }
              name={ fieldName }
              idx={ i }
              parent={ this.parent }
              def={ field }
              optChange={ this.optChange }
            />
          );
        }));
      } else {
        let fieldName = 'Field';
        let ref = {};

        if ('$ref' in def.items) {
          fieldName = def.items.$ref.replace(/^#\/definitions\//, '');
          ref = safeGet(safeGet(schema, 'definitions', {}), fieldName, {});
        } else if ('type' in def.items) {
          ref = { ...def.items };
        }
        fields.push(
          <Field
            key={ i }
            name={ fieldName }
            idx={ i }
            parent={ this.parent }
            def={ ref }
            optChange={ this.optChange }
          />
        );
      }
    }

    return (
      <FormGroup tag="fieldset" className="border border-dark p-2">
        <legend>
          { (isOptionalJSON(def.req, name) ? '' : '*') + name }
          <Button
            color="danger"
            className={ `float-right p-1 ${min ? 'disabled' : ''}` }
            onClick={ this.removeOpt }
          >
            <FontAwesomeIcon icon={ faMinusSquare } size="lg" />
          </Button>
          <Button
            color="primary"
            className={ `float-right p-1 ${max ? 'disabled' : ''}` }
            onClick={ this.addOpt }
          >
            <FontAwesomeIcon icon={ faPlusSquare } size="lg" />
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
