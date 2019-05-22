const indent = 2
const fmt = require('string-format')
const vkbeautify = require('vkbeautify')

/* Schema Utils */
export const FormatJADN = (schema, indent=2, _level=0) => {
	let _indent = (indent % 2 == 1 ? indent - 1 : indent) + (_level * 2)
	let ind = ' '.repeat(_indent)
	let ind_e = ' '.repeat(_indent - 2)

    if (Array.isArray(schema)) {
        let nested = schema && Array.isArray(schema[0])
        let lvl = (nested && Array.isArray(schema[schema.length - 1])) ? _level + 1: _level
        let lines = schema.map(val => FormatJADN(val, indent, lvl))

        if (nested) {
            return fmt("[\n{ind}", {ind: ind}) + lines.join(fmt(",\n{ind}", {ind: ind})) + fmt("\n{ind_e}]", {ind_e: ind_e})
        }
        return fmt("[{lines}]", {lines: lines.join(', ')})

    } else if (typeof(schema) == "object") {
        let lines = Object.keys(schema).map(key => {
            let val = schema[key]
            return fmt("{ind}\"{k}\": {v}", {ind: ind, k: key, v: FormatJADN(val, indent, _level+1)})
        }).join(",\n")
        return fmt("{{\n{lines}\n{ind_e}}}", {lines: lines, ind_e: ind_e})

    } else if (['string', 'number'].indexOf(typeof(schema)) >= 0) {
        return JSON.stringify(schema)
    } else {
        return "\"N/A\""
    }
}
