export const deleteCharAt = (string, position) => string.slice(0, position) + string.slice(position + 1);

export const followedBySymbol = (tokens, tokenID, options) => {
    if (tokens === undefined) console.error('tokens argument must be an array.');
    if (tokenID === undefined) console.error('tokenID argument must be an integer.');
    if (options === undefined) console.error('options argument must be an array.');
    if (tokenID === tokens.length - 1) return false;

    for (var i = tokenID + 1; i < tokens.length; i++) {
        const nextToken = tokens[i];
        switch (nextToken.type) {
            case 'space':
            case 'linebreak':
                break;
            case 'symbol':
            case 'colon':
                return options.indexOf(nextToken.string) > -1 ? i : false
                break;
            default:
                return false;
                break;
        }
    }
    return false;
}

export const followsSymbol = (tokens, tokenID, options) => {
    if (tokens === undefined) console.error('tokens argument must be an array.');
    if (tokenID === undefined) console.error('tokenID argument must be an integer.');
    if (options === undefined) console.error('options argument must be an array.');
    if (tokenID === 0) return false;

    for (var i = tokenID - 1; i >= 0; i--) {
        const previousToken = tokens[i];
        switch (previousToken.type) {
            case 'space':
            case 'linebreak':
                break;
            case 'symbol':
            case 'colon':
                return (options.indexOf(previousToken.string) > -1);
                break;
            default:
                return false;
                break;
        }
    }
    return false;
}

export const typeFollowed = (tokens, tokenID) => {
    if (tokens === undefined) console.error('tokens argument must be an array.');
    if (tokenID === undefined) console.error('tokenID argument must be an integer.');
    if (tokenID === 0) return false;

    for(var i = tokenID - 1; i >= 0; i--){
        const previousToken = tokens[i];
        switch (previousToken.type) {
            case 'space':
            case 'linebreak':
                break;
            default:
                return previousToken.type;
                break;
        }
    }
    return false;
}

export const newSpan = (i, token, depth, colors) => {
    colors = colors || {};
    let type = token.type,
        string = token.string,
        color = '';

    switch(type){
        case 'string':
        case 'number':
        case 'primitive':
        case 'error':
            color = colors[token.type];
            break;
        case 'key':
            color = string===' ' ? colors.keys_whiteSpace : colors.keys
            break;
        case 'symbol':
            color =  string===':' ? colors.colon : colors.default;
            break;
        default:
            color = colors.default;
            break;
    }

    if (string.length !== string.replace(/</g,'').replace(/>/g,'').length) {
        string = '<xmp style=display:inline;>' + string + '</xmp>';
    }

    return (
        '<span' +
        ' type="' + type + '"' +
        ' value="' + string + '"' +
        ' depth="' + depth + '"' +
        ' style="color: '+ color + '"' +
        '>' + string +
        '</span>'
    );
}

// Test Move functions