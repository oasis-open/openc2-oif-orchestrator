import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormText } from 'reactstrap';

import { zip, JADN_KEYS, JADN_SCHEMA_PROPS } from '../utils';
import { safeGet } from '../../../../../utils';


class Field extends Component {
  constructor(props, context) {
    super(props, context);
    this.schema_types = safeGet(safeGet(this.props, 'schema', {}), 'types', []);
    this.ignore_fields = ['Enumerated'];
  }

  shouldComponentUpdate(nextProps, nextState) {
    const propsUpdate = this.props !== nextProps;
    const stateUpdate = this.state !== nextState;

    if (propsUpdate) {
      this.schema_types = safeGet(safeGet(this.props, 'schema', {}), 'types', []);
    }
    return propsUpdate || stateUpdate;
  }

  buildField(def, key=null) {
    const fieldArgs = {
      key,
      def,
      name: def.name,
      parent: this.props.parent || '',
      optChange: (k, v) => this.props.optChange(k, v, this.props.idx)
    };

    if ('id' in def) {
      const typeDef = this.schema_types.filter(type => type[0] === def.type);
      if (typeDef.length === 1) {
        fieldArgs.def = zip(JADN_KEYS.Structure, typeDef[0]);
        fieldArgs.def.desc = def.desc;
      }
    }

    switch (fieldArgs.def.type) {
      case 'Array':
        return <FormText key={ key } >Array: { fieldArgs.name }</FormText>;
      case 'ArrayOf':
        // eslint-disable-next-line global-require
        const ArrayOf = require('./arrayOf').default;
        return <ArrayOf { ...fieldArgs } />;
      case 'Choice':
        // eslint-disable-next-line global-require
        const Choice = require('./choice').default;
        return <Choice { ...fieldArgs } />;
      case 'Enumerated':
        // eslint-disable-next-line global-require
        const Enumerated = require('./enumerated').default;
        return <Enumerated { ...fieldArgs } />;
      case 'Map':
        // eslint-disable-next-line global-require
        const Map = require('./map').default;
        return <Map { ...fieldArgs } />;
      case 'Record':
        // eslint-disable-next-line global-require
        const Record = require('./record').default;
        return <Record { ...fieldArgs } />;
      default:
        // eslint-disable-next-line global-require
        const Basic = require('./basicField').default;
        return <Basic { ...fieldArgs } />;
    }
  }

  render() {
    if ('fields' in this.props.def && this.ignore_fields.indexOf(this.props.def.type) === -1) {
      return this.props.def.fields.map((def, i) => this.buildField(zip(JADN_KEYS.Gen_Def, def), i));
    }
    return this.buildField(this.props.def);
  }
}

Field.propTypes = {
  def: PropTypes.object,
  idx: PropTypes.number,
  optChange: PropTypes.func,
  parent: PropTypes.string,
  schema: JADN_SCHEMA_PROPS
};

Field.defaultProps = {
  def: {},
  idx: null,
  optChange: null,
  parent: '',
  schema: {}
};

const mapStateToProps = state => ({
  schema: state.Generate.selectedSchema
});

export default connect(mapStateToProps)(Field);
