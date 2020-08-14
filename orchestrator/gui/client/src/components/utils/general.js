// General utility functions
import { format, parseISO } from 'date-fns';

export const checkSchema = schema => {
  if (typeof schema !== 'object') {
    try {
      return JSON.parse(schema);
    } catch (err) {
      console.error('Cannot load schema', err);
      return {};
    }
  }
  return schema;
};

export const titleCase = str => str.split(/\s/g).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

export const safeGet = (obj, key, def) => {
  if (key in obj) {
    return obj[key];
  }
  return def || null;
};

export const iso2local = date => {
  try {
    const d = parseISO(date);
    return format(d, 'EEEE, MMMM do yyyy, h:mm:ss a zzzz');
  } catch (e) {
    return date;
  }
};

export const objectValues = obj => Object.keys(obj).map(k => obj[k]);
