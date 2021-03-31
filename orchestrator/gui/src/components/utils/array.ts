// Array utility functions

// eslint-disable-next-line import/prefer-default-export
export const mergeByProperty = <Val=Record<string, any>>(arr1: Array<Val>, arr2: Array<Val>, prop: string): Array<Val> => {
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
