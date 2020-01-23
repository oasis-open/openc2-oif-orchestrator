// Array utility functions

export const mergeByProperty = (arr1, arr2, prop) => {
  let tmp = [ ...(arr1 || []) ]

  arr2.forEach(arr2obj => {
    let obj = tmp.find(arr1obj => arr1obj[prop] === arr2obj[prop])
    obj ? Array.prototype.push.apply(obj, arr2obj) : tmp.push(arr2obj)
  })
  return tmp
}

export const updateArray = (arr1={}, arr2={}) => {
  Object.keys(arr2).forEach(key => {
    arr1[key] = arr2[key]
  })

  return arr1
}