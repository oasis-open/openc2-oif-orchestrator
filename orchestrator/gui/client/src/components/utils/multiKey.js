// Nested associated array manipulation

// Set value on a nested key
export const setMultiKey = (arr, key, val) => {
  const k = key.replace(/\[\]$/, '');
  const keys = k.split('.');

  if (keys.length > 1) {
    if (!(keys[0] in arr)) {
      // eslint-disable-next-line no-param-reassign
      arr[keys[0]] = {};
    }
    setMultiKey(arr[keys[0]], keys.slice(1).join('.'), val);
  } else {
    // eslint-disable-next-line no-param-reassign
    arr[k] = val;
  }
};

// Get value of a nested key
export const getMultiKey = (arr, key) => {
  const k = key.replace(/\[\]$/, '');
  const keys = k.split('.');

  if (keys.length > 1) {
    return keys[0] in arr ? getMultiKey(arr[keys[0]], keys.slice(1).join('.')) : '';
  }
  return k in arr ? arr[k] : '';
};

// Delete a nested key
export const delMultiKey = (arr, key) => {
  const k = key.replace(/\[\]$/, '');
  const keys = k.split('.');

  if (keys.length > 1) {
    delMultiKey(arr[keys[0]], keys.slice(1).join('.'), null);
  } else if (arr && keys[0] in arr) {
    // eslint-disable-next-line no-param-reassign
    delete arr[keys[0]];
  }
};
