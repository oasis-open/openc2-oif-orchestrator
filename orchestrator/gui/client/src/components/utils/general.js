const checkSchema = (schema) => {
    if (typeof(schema) !== 'object') {
        try {
            schema = JSON.parse(schema)
        } catch (err) {
            //console.log('Cannot load schema', err)
            schema = {}
        }
    }
    return schema
}

const titleCase = (str) => str.split(/\s/g).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')

export {
    checkSchema,
    titleCase
}