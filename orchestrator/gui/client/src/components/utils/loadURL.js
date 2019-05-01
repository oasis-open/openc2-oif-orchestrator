import React from 'react'

import {
    cbor2escaped,
    dehexify,
    escaped2cbor,
    hexify
} from './'

/* Async load of a file from a generic url */
const readAllChunks = (stream) => {
    const reader = stream.getReader()
    const chunks = []

    const pump = () => {
        return reader.read().then(({ value, done }) => {
            if (done) {
                return chunks
            }
            chunks.push(value)
            return pump()
        })
    }
    return pump();
}

const chunk2str = (chunks) => {
    if (chunks.length == 1) {
        let rtn_arr = Array.from(chunks[0])
        rtn_arr = rtn_arr.map((c) => c > 128 ? "\\x"+c.toString(16) : String.fromCharCode(c))
        return rtn_arr.join('')
    } else {
        return ''
    }
}

export const validURL = (url) => url.match(/^(https?:\/\/)?(www\.)?[0-9a-z]+([\-\.]{1}[0-9a-z]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/)


const loadURL = (url) => {
    if (!validURL(url)) {
	    return new Promise((resolve, reject) => {
	        reject({
	            error: 'invalid url'
	        })
	    })
    }

    let rtn_arr = {
        data: '',
        file: url.substring(url.lastIndexOf("/") + 1)
    }
    rtn_arr.fileName = rtn_arr.file.substring(0, rtn_arr.file.lastIndexOf("."))
    rtn_arr.fileExt = rtn_arr.file.substring(rtn_arr.file.lastIndexOf(".") + 1)

	return fetch(url).then(
	    (rsp) => readAllChunks(rsp.body)
    ).then((chunks) => {
        let data = chunk2str(chunks)
        switch (rtn_arr.fileExt) {
            case 'jadn':
            case 'json':
                console.log('JADN/JSON')
                try {
                    data = JSON.parse(data)
                } catch (err) {
                    data = {error: err.message}
                }
                break;
            case 'cbor':
                console.log('CBOR')
                data = escaped2cbor(hexify(data))
                break;
            case 'xml':
                console.log('XML')
                break;
            default:
                console.log('UNKNOWN')
                break;
        }
        rtn_arr.data = data
        return rtn_arr
    }).catch((err) => {
        console.log("failed to load ", url, err.stack)
        return rtn_arr
    })
}

export default loadURL