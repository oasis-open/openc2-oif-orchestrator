// General
const deleteCharAt = (string, position) => string.slice(0, position) + string.slice(position + 1);

const add_tokenSecondary = (buffer) => {
  if (buffer.tokenSecondary.length === 0) return false;
  buffer.tokens.push(buffer.tokenSecondary);
  buffer.tokenSecondary = '';
  return true;
}

const add_tokenPrimary = (buffer, value) => {
  if (value.length === 0) return false;
  buffer.tokens.push(value);
  return true;
}

// DomNode_Update
export const quarkize = (text, prefix='') => {
  let buffer = {
    active: false,
    string: '',
    number: '',
    symbol: '',
    space: '',
    delimiter: '',
    quarks: []
  };

  const pushAndStore = (char, type) => {
    switch (type) {
      case 'symbol':
      case 'delimiter':
        if (buffer.active) {
          buffer.quarks.push({
            string: buffer[buffer.active],
            type: prefix + '-' + buffer.active
          });
        }
        buffer[buffer.active] = '';
        buffer.active  = type;
        buffer[buffer.active] = char;
        break;
      default:
        if (type !== buffer.active || ([buffer.string,char].indexOf('\n') > -1)) {
          if (buffer.active) {
            buffer.quarks.push({
              string: buffer[buffer.active],
              type: prefix + '-' + buffer.active
            });
          }
          buffer[buffer.active] = '';
          buffer.active  = type;
          buffer[buffer.active] = char;
        } else {
          buffer[type] += char;
        }
        break;
    }
  }

  const finalPush = () => {
    if (buffer.active) {
      buffer.quarks.push({
        string: buffer[buffer.active],
        type: prefix + '-' + buffer.active
      });
      buffer[buffer.active] = '';
      buffer.active = false;
    }
  }

  text.split('').forEach((char, i) => {
    switch (char) {
      case '"':
      case "'":
        pushAndStore(char,'delimiter');
        break;
      case ' ':
      case '\u00A0':
        pushAndStore(char,'space');
        break;
      case '{':
      case '}':
      case '[':
      case ']':
      case ':':
      case ',':
        pushAndStore(char,'symbol');
        break;
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        pushAndStore(char, buffer.active === 'string' ? 'string' : 'number');
        break;
      case '-'  :
        if (i < text.length - 1 && '0123456789'.indexOf(text.charAt(i + 1)) > -1) {
          pushAndStore(char, 'number');
          break;
        }
      case '.' :
        if (i < text.length - 1 && i > 0) {
          if ('0123456789'.indexOf(text.charAt(i + 1)) > -1 && '0123456789'.indexOf(text.charAt(i - 1)) > -1) {
            pushAndStore(char, 'number');
            break;
          }
        }
      default:
        pushAndStore(char, 'string');
        break;
    }
  })

  finalPush();
  return buffer.quarks;
}

export const validToken = (string, type) => {
  const quotes = '\'"';
  let firstChar = '',
    lastChar  = '',
    quoteType = false;

  switch (type) {
    case 'primitive':
      if (['true','false','null','undefined'].indexOf(string) === -1) return false;
    case 'string':
      if (string.length < 2) return false;
      firstChar = string.charAt(0)
      lastChar = string.charAt(string.length-1)
      quoteType = quotes.indexOf(firstChar)

      if (quoteType === -1 ||firstChar !== lastChar) return false;
      string.split('').forEach((char, i) => {
        if (i > 0 && i < string.length - 1)
          if (char === quotes[quoteType] && string.charAt(i - 1) !== '\\')
            return false;
      })
    case 'key':
      if (string.length === 0) return false;
      firstChar = string.charAt(0)
      lastChar = string.charAt(string.length-1)
      quoteType = quotes.indexOf(firstChar)

      if (quoteType > -1) {
        if (string.length === 1 || firstChar !== lastChar) return false;
        for (var i = 0; i < string.length; i++) {
          if (i > 0 && i < string.length - 1)
            if (string.charAt(i) === quotes[quoteType])
              if (string.charAt(i - 1) !== '\\') return false;
        }
      } else {
        const nonAlphanumeric = '\'"`.,:;{}[]&<>=~*%\\|/-+!?@^ \xa0';
        nonAlphanumeric.split('').forEach((nonAlpha, i) => {
          if (string.indexOf(nonAlpha) > -1) return false;
        })
      }
    case 'number':
      string.split('').forEach((char, i) => {
        if ('0123456789'.indexOf(char) === -1)
          if ((i === 0 && '-' !== string.charAt(0)) || '.' !== char) return false;
      })
    case 'symbol':
      if (string.length > 1 || '{[:]},'.indexOf(string) === -1) return false;
    case 'colon':
      if (string.length > 1 || ':' !== string) return false;
    default:
      return true;
  }
  return true;
}

export const tokenFollowed = (buffer) => {
  const last = buffer.tokens_normalize.length - 1;
  if (last < 1) return false;
  for (var i = last; i >= 0; i--) {
    const previousToken = buffer.tokens_normalize[i];
    switch (previousToken.type) {
      case 'space':
      case 'linebreak':
        break;
      default:
        return previousToken;
    }
  }
  return false;
}

export const followedBySymbol = (buffer, tokenID, options) => {
  if (tokenID === undefined) {
    console.error('tokenID argument must be an integer.');
  }
  if (options === undefined) {
    console.error('options argument must be an array.');
  }
  if (tokenID === buffer.tokens_merge.length-1) return false;

  for (var i = tokenID + 1; i < buffer.tokens_merge.length; i++) {
    const nextToken = buffer.tokens_merge[i];

    switch (nextToken.type) {
      case 'space':
      case 'linebreak':
        break;
      case 'symbol':
      case 'colon':
        if (options.indexOf(nextToken.string)>-1) {
          return i;
        } else {
          return false;
        }
        break;
      default:
        return false;
        break;
    }
  }
  return false;
}

export const followsSymbol = (buffer, tokenID, options) => {
  if (tokenID === undefined) {
    console.error('tokenID argument must be an integer.');
  }
  if (options === undefined) {
    console.error('options argument must be an array.');
  }
  if (tokenID === 0) return false;

  for (var i = tokenID - 1; i >= 0; i--) {
    const previousToken = buffer.tokens_merge[i];

    switch (previousToken.type) {
      case 'space':
      case 'linebreak':
        break;
      case 'symbol':
      case 'colon':
        if (options.indexOf(previousToken.string) > -1) {
          return true;
        }
        return false;
        break;
      default:
        return false;
        break;
    }
  }
  return false;
}

export const typeFollowed = (buffer, tokenID) => {
  if (tokenID === undefined) {
    console.error('tokenID argument must be an integer.');
  }
  if (tokenID === 0) return false;

  for (var i = tokenID - 1; i >= 0; i--) {
    const previousToken = buffer.tokens_merge[i];
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

// JSON_Placeholder
export const escape_character = (buffer) => {
  if (buffer.currentChar !== '\\') return false;
  buffer.inputText = deleteCharAt(buffer.inputText, buffer.position);
  return true;
}

export const determine_string = (buffer) => {
  if ('\'"'.indexOf(buffer.currentChar) === -1) return false;

  if (!buffer.stringOpen) {
    add_tokenSecondary(buffer);
    buffer.stringStart = buffer.position;
    buffer.stringOpen = buffer.currentChar;
    return true;
  }

  if (buffer.stringOpen === buffer.currentChar) {
    add_tokenSecondary(buffer);
    const stringToken = buffer.inputText.substring(buffer.stringStart, buffer.position + 1);
    add_tokenPrimary(buffer, stringToken);
    buffer.stringOpen = false;
    return true;
  }
  return false;
}

export const determine_value = (buffer) => {
  if (':,{}[]'.indexOf(buffer.currentChar) === -1) return false;

  if (buffer.stringOpen) return false;
  add_tokenSecondary(buffer);
  add_tokenPrimary(buffer, buffer.currentChar);
  switch (buffer.currentChar) {
    case ':':
      buffer.isValue = true;
      return true;
      break;
    case '{':
    case '[':
      buffer.brackets.push(buffer.currentChar);
      break;
    case '}':
    case ']':
      buffer.brackets.pop();
      break;
  }

  if (buffer.currentChar !== ':') {
    buffer.isValue = (buffer.brackets[buffer.brackets.length-1]==='[');
  }
  return true;
}

export const stripQuotesFromKey = (text) => {
  if (text.length === 0) return text;
  if (['""',"''"].indexOf(text) > -1) return "''";

  let wrappedInQuotes = false;
  for (var i = 0; i < 2; i++) {
    if ([text.charAt(0), text.charAt(text.length-1)].indexOf(['"',"'"][i]) > -1) {
      wrappedInQuotes = true;
      break;
    }
  }

  if (wrappedInQuotes && text.length >= 2) {
    text = text.slice(1, -1);
  }

  const nonAlphaNumeric = text.replace(/\w/g,''),
    alphaNumeric = text.replace(/\W+/g,''),
    mayRemoveQuotes = ((nonAlphaNumeric,text) => {
      let numberAndLetter = false;
      for (var i = 0; i < text.length; i++) {
        if (i === 0) if(isNaN(text.charAt(i))) break;
        if (isNaN(text.charAt(i))) {
          numberAndLetter = true;
          break;
        }
      }
      return !(nonAlphaNumeric.length > 0 || numberAndLetter);
    })(nonAlphaNumeric, text),
    hasQuotes = (string => {
      for (var i = 0; i < string.length; i++) {
        if (["'",'"'].indexOf(string.charAt(i)) > -1) return true;
      }
      return false;
    })(nonAlphaNumeric);

  if (hasQuotes) {
    let newText = '';
    const charList = text.split('');

    for (var ii = 0; ii < charList.length; ii++) {
      let char = charList[ii];
      if (["'",'"'].indexOf(char)>-1) char = '\\' + char;
      newText += char;
    }
    text = newText;
  }

  return mayRemoveQuotes ? text : "'" + text + "'";
}

export const indent = (number) => (number > 0 ? '\n' : '') + Array(number * 2).fill(' ').join('');