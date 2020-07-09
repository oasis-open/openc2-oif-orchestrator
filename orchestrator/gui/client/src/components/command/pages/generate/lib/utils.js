import PropTypes from 'prop-types';

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

export const isOptionalJSON = (req, field) => {
  if (req && Array.isArray(req)) {
    return req.indexOf(field) >= 0;
  }
  return false;
};