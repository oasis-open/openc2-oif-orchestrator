// General utility functions

const checkSchema = (schema) => {
  if (typeof(schema) !== 'object') {
    try {
      schema = JSON.parse(schema)
    } catch (err) {
      console.log('Cannot load schema', err)
      schema = {}
    }
  }
  return schema
}

const titleCase = (str) => str.split(/\s/g).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')

const safeGet = (obj, attr, def=null) => {
  try {
    if (obj.hasOwnProperty(attr)) {
      return Object.getOwnPropertyDescriptor(obj, attr).value
    } else if (obj.hasAttribute(attr)) {
      return obj.getAttribute(attr)
    }
  } catch (err) {}
  return def
}

export {
  checkSchema,
  safeGet,
  titleCase
}