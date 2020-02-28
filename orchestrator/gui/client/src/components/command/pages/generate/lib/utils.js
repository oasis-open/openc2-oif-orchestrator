import PropTypes from 'prop-types';

export const JADN_KEYS = {
  // Structures
  Structure: [
    'name',     // 0 - TNAME - Datatype name
    'type',     // 1 - TTYPE - Base type - built-in or defined
    'opts',     // 2 - TOPTS - Type options
    'desc',     // 3 - TDESC - Type description
    'fields'    // 4 - FIELDS - List of fields
  ],
  // Field Definitions
  Enum_Def: [
    'id',       // 0 - FTAG - Element ID
    'value',    // 1 - FNAME - Element name
    'desc'      // 2 - EDESC - Enumerated value description
  ],
  Gen_Def: [
    'id',       // 0 - FTAG - Element ID
    'name',     // 1 - FNAME - Element name
    'type',     // 2 - FTYPE - Datatype of field
    'opts',     // 3 - FOPTS - Field options
    'desc'      // 4 - FDESC - Field Description
  ]
};

export const JADN_SCHEMA_PROPS = PropTypes.shape({
  meta: PropTypes.shape({
    module: PropTypes.string,
    patch: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    imports: PropTypes.object,
    exports: PropTypes.arrayOf(PropTypes.string),
    config: PropTypes.exact({
      $MaxBinary: PropTypes.number,
      $MaxString: PropTypes.number,
      $MaxElements: PropTypes.number,
      $Sys: PropTypes.string,
      $FS: PropTypes.string,
      $TypeName: PropTypes.string,
      $FieldName: PropTypes.string,
      $NSID: PropTypes.string
    })
  }).isRequired,
  types: PropTypes.arrayOf(PropTypes.array).isRequired
});

export const JSON_SCHEMA_PROPS = PropTypes.shape({
  $schema: PropTypes.string.isRequired,
  $id: PropTypes.string.isRequired,
  title: PropTypes.string,
  type: (props, propName, componentName) => {
    if (props[propName] !== 'object') {
      return new Error(`Invalid prop '${propName}' supplied to '${componentName}'. Validation failed.`);
    }
  },
  description: PropTypes.string,
  oneOf: PropTypes.arrayOf(PropTypes.exact({
    $ref: PropTypes.string.isRequired,
    description: PropTypes.string
  })),
  definitions: PropTypes.object
});

export const isOptionalJADN = def => {
  if ('opts' in def) {
    return def.opts.indexOf('[0') >= 0;
  }
  return false;
};

export const isOptionalJSON = (req, field) => {
  if (req && Array.isArray(req)) {
    return req.indexOf(field) >= 0;
  }
  return false;
};

export const opts2arr = opts => {
  const rtnOpts = {};
  const jadnOpts = {
    // Type Options
    '=': 'compact',
    '[': 'min',
    ']': 'max',
    '*': 'rtype',
    '$': 'pattern',
    '@': 'format'
  };

  opts.forEach(opt => {
    const optChar = opt.charAt(0);
    const optVal = opt.substr(1);
    if (optChar in jadnOpts) {
      rtnOpts[jadnOpts[optChar]] = optVal;
    } else {
      console.warn('Unknown option', optChar);
    }
  });
  return rtnOpts;
};

export const zip = (keys, arr) => {
  return arr.map((val, i) => ({ [keys[i]]: val })).reduce((obj, itm) => ({ ...obj, ...itm }), {});
};