import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { JSON_SCHEMA_PROPS } from '../utils';
import { safeGet } from '../../../../../utils';


const Field = props => {
  let def = { ...props.def };

  if ('$ref' in def) {
    const refName = def.$ref.replace(/^#\/definitions\//, '');
    delete def.$ref;

    def = {
      ...props.schema.definitions[refName],
      ...def
    };
  }

  const fieldArgs = {
    def,
    root: props.root,
    parent: props.parent,
    name: props.name || def.name,
    required: props.required,
    optChange: (k, v) => props.optChange(k, v, props.idx)
  };

  switch (def.type) {
    case 'object':
      const minProps = safeGet(def, 'minProperties');
      const maxProps = safeGet(def, 'maxProperties');
      if (minProps === 1 && maxProps === 1) {
        // eslint-disable-next-line global-require
        const Choice = require('./choice').default;
        return <Choice { ...fieldArgs } />;

      } else if (minProps >= 1 && maxProps == null) {
        // eslint-disable-next-line global-require
        const Map = require('./map').default;
        return <Map { ...fieldArgs } />;

      } else if ('properties' in def || (minProps == null && maxProps == null)) {
        // eslint-disable-next-line global-require
        const Record = require('./record').default;
        return <Record { ...fieldArgs } />;
      }
      return <p><strong>Object</strong>: { props.name }</p>;
    case 'array':
      // eslint-disable-next-line global-require
      const Array = require('./array').default;
      return <Array { ...fieldArgs } />;
    default:
      if ('enum' in def || 'oneOf' in def) {
        // eslint-disable-next-line global-require
        const Enumerated = require('./enumerated').default;
        return <Enumerated { ...fieldArgs } />;
      }
      // eslint-disable-next-line global-require
      const Basic = require('./basicField').default;
      return <Basic { ...fieldArgs } />;
  }
};

Field.propTypes = {
  idx: PropTypes.number,
  root: PropTypes.bool,
  parent: PropTypes.string,
  name: PropTypes.string,
  def: PropTypes.object,
  required: PropTypes.bool,
  optChange: PropTypes.func,
  schema: JSON_SCHEMA_PROPS
};

Field.defaultProps = {
  idx: null,
  root: false,
  name: 'Field',
  parent: '',
  def: {},
  required: false,
  optChange: null,
  schema: {}
};

const mapStateToProps = state => ({
  schema: state.Generate.selectedSchema
});

export default connect(mapStateToProps)(Field);
