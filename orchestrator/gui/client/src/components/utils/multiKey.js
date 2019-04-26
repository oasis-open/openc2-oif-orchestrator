/*
Nested associated array manipulation
*/

// Set value on a nested key
export const setMultiKey = (arr, key, val) => {
    key = key.replace(/\[\]$/, '')
	let keys = key.split('.')

	if (keys.length > 1) {
	    if (!arr.hasOwnProperty(keys[0])) {
			arr[keys[0]] = {}
		}
		setMultiKey(arr[keys[0]], keys.slice(1).join('.'), val)
	} else {
	    arr[key] = val
	}
}

// Get value of a nested key
export const getMultiKey = (arr, key) => {
    key = key.replace(/\[\]$/, '')
    let keys = key.split('.')

    if (keys.length > 1) {
        return arr.hasOwnProperty(keys[0]) ? getMultiKey(arr[keys[0]], keys.slice(1).join('.')) : ''
    } else {
        return arr.hasOwnProperty(key) ? arr[key] : ''
    }
}


// Delete a nested key
export const delMultiKey = (arr, key) => {
    key = key.replace(/\[\]$/, '')
	let keys = key.split('.')

	if (keys.length > 1) {
		delMultiKey(arr[keys[0]], keys.slice(1).join('.'), null)
	} else if (arr && arr.hasOwnProperty(keys[0])) {
	    delete arr[keys[0]]
	}
}