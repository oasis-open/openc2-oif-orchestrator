// General utility functions

export const checkSchema = schema => {
  if (typeof schema !== 'object') {
    try {
      return JSON.parse(schema);
    } catch (err) {
      console.log('Cannot load schema', err);
      return {};
    }
  }
  return schema;
};

export const titleCase = (str) => str.split(/\s/g).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

export const safeGet = (obj, key, def) => {
  if (key in obj) {
    return obj[key];
  }
  return def || null;
};
