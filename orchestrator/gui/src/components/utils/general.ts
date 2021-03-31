// General utility functions
import { format, parseISO } from 'date-fns';
import { JSONSchema7 } from 'json-schema';

export const checkSchema = (schema: string|JSONSchema7): JSONSchema7 => {
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

export const titleCase = (str: string): string => str.split(/\s/g).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

export const safeGet = <Val>(obj: Record<string, Val>, key: string, def?: Val): undefined|Val => {
  if (key in obj) {
    return obj[key];
  }
  return def;
};

export const iso2local = (date: string): string => {
  try {
    const d = parseISO(date);
    return format(d, 'EEEE, MMMM do yyyy, h:mm:ss a zzzz');
  } catch (e) {
    return date;
  }
};

export const objectValues = <Value>(obj: Record<string, Value>): Array<Value> => Object.keys(obj).map(k => obj[k]);

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
 export function isFunction(obj: any): boolean {
  return obj && {}.toString.call(obj) === '[object Function]';
}

export function pick(obj: Record<string, any>, keys: Array<string>): Record<string, any> {
  const ret = Object.create(null);
  keys.forEach(k => {
    if (k in obj) {
      ret[k] = obj[k];
    }
  });
  return ret;
}