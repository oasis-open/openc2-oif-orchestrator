/* CBOR Utils */
export const cbor2escaped = (c) => {
    c = c.replace(/\s/g, '')
    if (!c.match(/^[0-9a-fA-F]+$/)) {
        throw {message: "cannot convert, not valid hexidecimal"}
    } else if (c.length % 2 == 1) {
        throw {message: "cannot convert, not valid length"}
    }
    c = c.match(/.{1,2}/g)

	return c.map((si, i) => {
	    let ci = parseInt(si, 16)
	    return ci > 128 ? "\\x"+si : String.fromCharCode(ci)
	}).join('').replace(/^\s+/, '')
}

export const escaped2cbor = (e) => {
    let tmp_e = e.replace(/\s/g, '')
    if (tmp_e.match(/^[0-9a-fA-F]+$/)) {
        throw {message: "cannot convert hexidecimal to hexidecimal"}
    }

	return e.split(/\\x/g).map((bi, i) => {
	    let tmp = [bi.substr(0, 2)]
	    return tmp.concat(bi.substr(2).split('').map((s) => s.charCodeAt(0).toString(16))).join(' ')
	}).join(' ').replace(/^\s+/, '')
}

export const hexify = (str) => {
	let rtnStr = ''
	str = str.toString()

	for (let i in str) {
		let code = str.charCodeAt(i)
		let char = str.charAt(i)
		rtnStr += ((code > 128) ? '\\x' + code.toString(16) : char)
	}
	return rtnStr
}

export const dehexify = (str) => {
	let rtnStr = ''
	str = str.toString().split(/\\x/g)

	for (let i in str) {
		let code = parseInt(str[i].substr(0, 2), 16)
		rtnStr += String.fromCharCode(code) + str[i].substr(2)
	}
	return rtnStr
}