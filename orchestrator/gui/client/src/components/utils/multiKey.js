export const setMultiKey = (a, k, v) => {
    k = k.replace(/\[\]$/, '')
	let keys = k.split('.')

	if (keys.length > 1) {
	    if (!a.hasOwnProperty(keys[0])) {
			a[keys[0]] = {}
		}
		setMultiKey(a[keys[0]], keys.slice(1).join('.'), v)
	} else {
	    a[k] = v
	}
}

export const getMultiKey = (a, k) => {
    k = k.replace(/\[\]$/, '')
    let keys = k.split('.')

    return keys.length > 1 ? (a.hasOwnProperty(keys[0]) ? getMultiKey(a[keys[0]], keys.slice(1).join('.')) : '') : (a.hasOwnProperty(k) ? a[k] : '')
}

export const delMultiKey = (a, k) => {
    k = k.replace(/\[\]$/, '')
	let keys = k.split('.')

	if (keys.length > 1) {
		delMultiKey(a[keys[0]], keys.slice(1).join('.'), null)
	} else if (a && a.hasOwnProperty(keys[0])) {
	    delete a[keys[0]]
	}
}