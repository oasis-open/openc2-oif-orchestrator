export const keys = {
  // Structures
  Structure: [
    'name',     // 0 - TNAME - Datatype name
    'type',     // 1 - TTYPE - Base type - built-in or defined
    'opts',     // 2 - TOPTS - Type options
    'desc',     // 3 - TDESC - Type description
    'fields'    // 4 - FIELDS - List of fields
  ],
  // Field Definitions
  Enum_Def: [
    'id',       // 0 - FTAG - Element ID
    'value',    // 1 - FNAME - Element name
    'desc'      // 2 - EDESC - Enumerated value description
  ],
  Gen_Def: [
    'id',       // 0 - FTAG - Element ID
    'name',     // 1 - FNAME - Element name
    'type',     // 2 - FTYPE - Datatype of field
    'opts',     // 3 - FOPTS - Field options
    'desc'      // 4 - FDESC - Field Description
  ]
}


export const isOptional_jadn = (def) => {
  if (def.hasOwnProperty("opts")) {
    return def.opts.indexOf('[0') >= 0
  } else {
    return false
  }
}

export const isOptional_json = (req, field) => {
  if (req && Array.isArray(req)) {
    return req.indexOf(field) >= 0
  }
  return false
}

export const opts2arr = (opts) => {
  let rtn_opts = {}
  let jadn_opts = {
    // Type Options
    '=': 'compact',
    '[': 'min',
    ']': 'max',
    '*': 'rtype',
    '$': 'pattern',
    '@': 'format'
  }

  opts.forEach(opt => {
    let opt_char = opt.charAt(0)
    let opt_val = opt.substr(1)

    if (jadn_opts.hasOwnProperty(opt_char)) {
      rtn_opts[jadn_opts[opt_char]] = opt_val
    } else {
      console.warn('Unknown option', opt_char)
    }
  })
  return rtn_opts
}

export const zip = (keys, arr) => {
  let arr_obj = {}
  for (let i in arr) {
    arr_obj[keys[i]] = arr[i]
  }
  return arr_obj
}