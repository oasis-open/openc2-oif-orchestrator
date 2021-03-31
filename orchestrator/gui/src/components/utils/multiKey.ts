// Nested associated array manipulation

// Set value on a nested key
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

// Get value of a nested key
export function getMultiKey<T>(obj: Record<string, any>, key: string): T | undefined {
  const k = key.replace(/\[\]$/, '');
  const keys = k.split('.');

  if (keys.length > 1) {
    return keys[0] in obj ? getMultiKey(obj[keys[0]], keys.slice(1).join('.')) : undefined;
  }
  return k in obj ? obj[k] : undefined;
}

// Delete a nested key
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
