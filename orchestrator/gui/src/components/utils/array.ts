// Array utility functions

/**
 * Merge two Object by a specified property
 * @param {Array<V>} arr1 Base array of object to merge
 * @param {Array<V>} arr2 Secondary array of object to merge
 * @param {string} prop Property to merge based on
 * @returns {Array<V>} Array of merged objects
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, import/prefer-default-export
export const mergeByProperty = <V extends Record<string, any>>(arr1: Array<V>, arr2: Array<V>, prop: string): Array<V> => {
  const rtn = [...(arr1 || [])];

  arr2.forEach(arr2obj => {
    const obj = rtn.find(arr1obj => arr1obj[prop] === arr2obj[prop]);
    if (obj) {
      Object.assign(obj, arr2obj);
    } else {
      rtn.push(arr2obj);
    }
  });
  return rtn;
};
