
export const isOptional = (def) => {
    switch (def.length) {
        case 5:
            return def[3].indexOf('[0') >= 0
		case 4:
		    return def[2].indexOf('[0') >= 0
		default:
		    console.log('default optional - ' + def[0] + ' - ' + def[1]);
			return false;
	}
}