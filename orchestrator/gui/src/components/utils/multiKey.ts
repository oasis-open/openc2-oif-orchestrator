// Nested associated array manipulation

/**
 * Set a nested key within an object
 * @param {Record<string, any>} obj Object to set the key of
 * @param {string} key Property to set, seperated by '.'
 * @param {any} val Value to set
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setMultiKey = (obj: Record<string, any>, key: string, val: any): void => {
  const k = key.replace(/\[\]$/, '');
  const keys = k.split('.');

  if (keys.length > 1) {
    if (!(keys[0] in obj)) {
      // eslint-disable-next-line no-param-reassign
      obj[keys[0]] = {};
    }
    setMultiKey(obj[keys[0]], keys.slice(1).join('.'), val);
  } else {
    // eslint-disable-next-line no-param-reassign
    obj[k] = val;
  }
};

/**
 * Get the nested value within an object
 * @param {Record<string, any>} obj Object to get the key of
 * @param {string} key Property to get, seperated by '.'
 * @returns {V|undefined} Value of the property
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getMultiKey<V>(obj: Record<string, any>, key: string): V | undefined {
  const k = key.replace(/\[\]$/, '');
  const keys = k.split('.');

  if (keys.length > 1) {
    return keys[0] in obj ? getMultiKey(obj[keys[0]], keys.slice(1).join('.')) : undefined;
  }
  return k in obj ? obj[k] : undefined;
}

/**
 * Delete the nested value within an object
 * @param {Record<string, any>} obj Object to delete the key of
 * @param {string} key Property to delete, seperated by '.'
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const delMultiKey = (obj: Record<string, any>, key: string): void => {
  const k = key.replace(/\[\]$/, '');
  const keys = k.split('.');

  if (keys.length > 1) {
    delMultiKey(obj[keys[0]], keys.slice(1).join('.'));
  } else if (obj && keys[0] in obj) {
    // eslint-disable-next-line no-param-reassign
    delete obj[keys[0]];
  }
};
