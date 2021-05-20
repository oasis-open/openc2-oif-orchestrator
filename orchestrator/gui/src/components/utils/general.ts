// General utility functions
import { format, parseISO } from 'date-fns';
import { Schema } from 'react-json-generator';

/**
 * Validate a schema is valid JSON
 * @param {string|JSONSchema7} schema schema to validate
 * @returns {Schema.JSONSchema} validated schema
 */
export const checkSchema = (schema: string|Schema.JSONSchema): Schema.JSONSchema => {
  if (typeof schema !== 'object') {
    try {
      return JSON.parse(schema);
    } catch (err) {
      console.error('Cannot load schema', err);
      return {} as Schema.JSONSchema;
    }
  }
  return schema;
};

/**
 * Sentense Case a string
 * @param {string} str String to capitalize all words
 * @returns {string} String with all words capitalized
 */
export const titleCase = (str: string): string => str.split(/\s/g).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

/**
 * Saftely get a property of an object
 * @param {Record<string, Val>} obj Object to get the property of
 * @param {string} key Property of object to get the value of
 * @param {Val} def Default value to return if key does not exist on the object
 * @returns {undefined|Val} the value of the property or a default value
 */
export const safeGet = <Val>(obj: Record<string, Val>, key: string, def?: Val): undefined|Val => {
  if (key in obj) {
    return obj[key];
  }
  return def;
};

/**
 * Parse an ISO-8601 date string and format it as `EEEE, MMMM do yyyy, h:mm:ss a zzzz`
 * @param {string} date ISO-8601 date string
 * @returns {string} Date formatted as `EEEE, MMMM do yyyy, h:mm:ss a zzzz`
 */
export const iso2local = (date: string): string => {
  try {
    const d = parseISO(date);
    return format(d, 'EEEE, MMMM do yyyy, h:mm:ss a zzzz');
  } catch (e) {
    return date;
  }
};

/**
 * Helper function for more compatibility of `Object.values`
 * @param {Record<string, Val>} obj Object to gather the values of
 * @returns {Val} Values of the given object
 */
export const objectValues = <Val>(obj: Record<string, Val>): Array<Val> => Object.keys(obj).map(k => obj[k]);

/**
 * Remove empty values of the given object
 * @param {Record<string, any>} obj Objectr to remove the empty values of
 * @param {Array<any>} empties The empty values to remove
 * @returns {Record<string, any>} Cleaned Object with empty values removed
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const removeEmpty = (obj: Record<string, any>, empties = [null, undefined, '']) => {
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      const rtnArr = [ ...obj ];
      rtnArr.forEach((val, idx) => {
        if (val && typeof val === 'object') {
          removeEmpty(val, empties);
        } else if (empties.includes(val)) {
          delete rtnArr[idx];
        }
      });
      return rtnArr;
    }

    const rtnObj = { ...obj };
    Object.keys(rtnObj).forEach(key => {
      const val = rtnObj[key];
      if (val && typeof val === 'object') {
        if (Array.isArray(val)) {
          rtnObj[key] = val.map(v => removeEmpty(v, empties));
        } else {
          removeEmpty(val);
        }
      } else if (empties.includes(val)) {
        delete rtnObj[key];
      }
    });
    return rtnObj;
  }
  return obj;
};

/**
  * Check if the given value is a function
  * @param {any} obj - value to validate is a function
  * @return {boolean} - bool if the given value is a function
  */
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 export function isFunction(obj: any): boolean {
  return obj && {}.toString.call(obj) === '[object Function]';
}

/**
 * Pick specified values from the given Object
 * @param {Record<string, any>} obj Object to pick specified values from
 * @param {Array<string>} keys Properties of the object to pick
 * @returns {Record<string, any>} New object with the specified properties or the original object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pick(obj: Record<string, any>, keys: Array<string>): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ret: Record<string, any> = {};
  keys.forEach(k => {
    if (k in obj) {
      ret[k] = obj[k];
    }
  });
  return ret;
}
