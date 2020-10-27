import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { JSON_SCHEMA_PROPS } from './utils';
import { safeGet } from '../../../../utils';


const Field = props => {
  const {
    def, idx, name, optChange, parent, required, root, schema
  } = props;

  let fieldDef = { ...def };

  if ('$ref' in fieldDef) {
    const refName = fieldDef.$ref.replace(/^#\/definitions\//, '');
    delete fieldDef.$ref;

    fieldDef = {
      ...schema.definitions[refName],
      ...fieldDef
    };
  }

  const fieldArgs = {
    def: fieldDef,
    root,
    parent,
    name: name || fieldDef.name,
    required,
    optChange: (k, v) => optChange(k, v, idx)
  };

  switch (fieldDef.type) {
    case 'object':
      const minProps = safeGet(fieldDef, 'minProperties');
      const maxProps = safeGet(fieldDef, 'maxProperties');
      switch (true) {
        case (minProps === 1 && maxProps === 1):
          // eslint-disable-next-line global-require
          const Choice = require('./choice').default;
          return <Choice { ...fieldArgs } />;
        case (minProps >= 1 && maxProps == null):
          // eslint-disable-next-line global-require
          const Map = require('./map').default;
          return <Map { ...fieldArgs } />;
        case ('properties' in fieldDef || (minProps == null && maxProps == null)):
          // eslint-disable-next-line global-require
          const Record = require('./record').default;
          return <Record { ...fieldArgs } />;
        default:
          return (
            <p>
              <strong>Object</strong>
              :&nbsp;
              { name }
            </p>
          );
      }
    case 'array':
      // eslint-disable-next-line global-require
      const Array = require('./array').default;
      return <Array { ...fieldArgs } />;
    default:
      if ('enum' in fieldDef || 'oneOf' in fieldDef) {
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
