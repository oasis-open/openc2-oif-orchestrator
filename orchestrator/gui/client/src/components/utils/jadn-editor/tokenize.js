/* eslint-disable no-param-reassign, no-underscore-dangle */
import { format } from 'react-json-editor-ajrm/locale';
import defaultLocale from 'react-json-editor-ajrm/locale/en';
import {
  deleteCharAt,
  followedBySymbol,
  followsSymbol,
  newSpan,
  typeFollowed
} from './utils';

// DOM Node || OnBlue or Update
// Helper Functions
const finalPush = (buffer, prefix = '') => {
  if (buffer.active) {
    buffer.quarks.push({
      string: buffer[buffer.active],
      type: `${prefix}-${buffer.active}`
    });
    buffer[buffer.active] = '';
    buffer.active = false;
  }
};

const pushAndStore = (buffer, char, type, prefix = '') => {
  switch (type) {
    case 'symbol':
    case 'delimiter':
      if (buffer.active) {
        buffer.quarks.push({
          string: buffer[buffer.active],
          type: `${prefix}-${buffer.active}}`
        });
      }
      buffer[buffer.active] = '';
      buffer.active = type;
      buffer[buffer.active] = char;
      break;
    default:
      if (type !== buffer.active || [buffer.string, char].indexOf('\n') > -1) {
        if (buffer.active) {
          buffer.quarks.push({
            string: buffer[buffer.active],
            type: `${prefix}-${buffer.active}}`
          });
        }
        buffer[buffer.active] = '';
        buffer.active = type;
        buffer[buffer.active] = char;
      } else {
        buffer[type] += char;
      }
      break;
  }
};

const quarkize = (text, prefix = '') => {
  const buffer = {
    active: false,
    string: '',
    number: '',
    symbol: '',
    space: '',
    delimiter: '',
    quarks: []
  };

  text.split('').forEach((char, i) => {
    switch (char) {
      case '"':
      case "'":
        pushAndStore(buffer, char, 'delimiter', prefix);
        break;
      case ' ':
      case '\u00A0':
        pushAndStore(buffer, char, 'space', prefix);
        break;
      case '{':
      case '}':
      case '[':
      case ']':
      case ':':
      case ',':
        pushAndStore(buffer, char, 'symbol', prefix);
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
        const type = buffer.active === 'string' ? 'string' : 'number';
        pushAndStore(buffer, char, type, prefix);
        break;
      case '-':
        if (i < text.length - 1 && '0123456789'.indexOf(text.charAt(i + 1)) > -1) {
          pushAndStore(buffer, char, 'number', prefix);
          break;
        }
      case '.':
        if (i < text.length - 1 && i > 0 && '0123456789'.indexOf(text.charAt(i + 1)) > -1 && '0123456789'.indexOf(text.charAt(i - 1)) > -1) {
          pushAndStore(buffer, char, 'number', prefix);
          break;
        }
      default:
        pushAndStore(buffer, char, 'string', prefix);
        break;
    }
  });
  finalPush(buffer, prefix);
  return buffer.quarks;
};

const validToken = (string, type) => {
  const quotes = '\'"';
  let firstChar = '';
  let lastChar = '';
  let quoteType = false;

  switch (type) {
    case 'primitive':
      if (['true', 'false', 'null', 'undefined'].indexOf(string) === -1) {
        return false;
      }
      break;
    case 'string':
      if (string.length < 2) {
        return false;
      }
      firstChar = string.charAt(0);
      lastChar = string.charAt(string.length - 1);
      quoteType = quotes.indexOf(firstChar);
      if (quoteType === -1 || firstChar !== lastChar) {
        return false;
      }
      for (let i = 0; i < string.length; i++) {
        if (i > 0 && i < string.length - 1 && string.charAt(i) === quotes[quoteType] && string.charAt(i - 1) !== '\\') {
          return false;
        }
      }
      break;
    case 'key':
      if (string.length === 0) {
        return false;
      }
      firstChar = string.charAt(0);
      lastChar = string.charAt(string.length - 1);
      quoteType = quotes.indexOf(firstChar);
      if (quoteType > -1) {
        if (string.length === 1 || firstChar !== lastChar) {
          return false;
        }
        for (let i = 0; i < string.length; i++) {
          if (i > 0 && i < string.length - 1 && string.charAt(i) === quotes[quoteType] && string.charAt(i - 1) !== '\\') {
            return false;
          }
        }
      } else {
        const nonAlphanumeric = '\'"`.,:;{}[]&<>=~*%\\|/-+!?@^ \xa0';
        for (let i = 0; i < nonAlphanumeric.length; i++) {
          const nonAlpha = nonAlphanumeric.charAt(i);
          if (string.indexOf(nonAlpha) > -1) {
            return false;
          }
        }
      }
      break;
    case 'number':
      for (let i = 0; i < string.length; i++) {
        if ('0123456789'.indexOf(string.charAt(i)) === -1 && i === 0) {
          if (string.charAt(0) !== '-') {
            return false;
          }
        } else if (string.charAt(i) !== '.') {
          return false;
        }
      }
      break;
    case 'symbol':
      if (string.length > 1 || '{[:]},'.indexOf(string) === -1) {
        return false;
      }
      break;
    case 'colon':
      if (string.length > 1 || string !== ':') {
        return false;
      }
      break;
    default:
      return true;
  }
  return true;
};

const tokenFollowed = buffer => {
  const last = buffer.tokens_normalize.length - 1;
  if (last < 1) {
    return false;
  }

  for (let i = last; i >= 0; i--) {
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
};

// Main Function
// eslint-disable-next-line camelcase
export const DomNode_Update = (obj, locale = defaultLocale, colors) => {
  const containerNode = obj.cloneNode(true);
  const hasChildren = containerNode.hasChildNodes();

  if (!hasChildren) {
    return '';
  }
  const children = containerNode.childNodes;

  const buffer = {
    tokens_unknown: [],
    tokens_proto: [],
    tokens_split: [],
    tokens_fallback: [],
    tokens_normalize: [],
    tokens_merge: [],
    tokens_plainText: '',
    indented: '',
    json: '',
    jsObject: undefined,
    markup: ''
  };

  children.forEach(child => {
    switch (child.nodeName) {
      case 'SPAN':
        buffer.tokens_unknown.push({
          string: child.textContent,
          type: child.attributes.type.textContent
        });
        break;
      case 'DIV':
        buffer.tokens_unknown.push({
          string: child.textContent,
          type: 'unknown'
        });
        break;
      case 'BR':
        if (child.textContent === '') {
          buffer.tokens_unknown.push({
            string: '\n',
            type: 'unknown'
          });
        }
        break;
      case '#text':
        buffer.tokens_unknown.push({
          string: child.wholeText,
          type: 'unknown'
        });
        break;
      case 'FONT':
        buffer.tokens_unknown.push({
          string: child.textContent,
          type: 'unknown'
        });
        break;
      default:
        console.error('Unrecognized node:', {
          child
        });
        break;
    }
  });

  buffer.tokens_proto = buffer.tokens_unknown.map(token => quarkize(token.string, 'proto')).reduce((all, quarks) => all.concat(quarks));

  buffer.tokens_proto.forEach(token => {
    if (token.type.indexOf('proto') === -1) {
      if (!validToken(token.string, token.type)) {
        buffer.tokens_split = buffer.tokens_split.concat(quarkize(token.string, 'split'));
      } else {
        buffer.tokens_split.push(token);
      }
    } else {
      buffer.tokens_split.push(token);
    }
  });

  buffer.tokens_fallback = buffer.tokens_split.map(token => {
    let { type } = token;
    const fallback = [];

    if (type.indexOf('-') > -1) {
      type = type.slice(type.indexOf('-') + 1);
      if (type !== 'string') {
        fallback.push('string');
      }
      fallback.push('key');
      fallback.push('error');
    }

    return {
      string: token.string,
      length: token.string.length,
      type,
      fallback
    };
  });

  const buffer2 = {
    brackets: [],
    isValue: false,
    stringOpen: false
  };

  buffer.tokens_normalize = buffer.tokens_fallback.map((token, i) => {
    const normalToken = {
      type: token.type,
      string: token.string
    };

    switch (normalToken.type) {
      case 'symbol':
      case 'colon':
        if (buffer2.stringOpen) {
          normalToken.type = buffer2.isValue ? 'string' : 'key';
          break;
        }
        switch (normalToken.string) {
          case '[':
          case '{':
            buffer2.brackets.push(normalToken.string);
            buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1] === '[';
            break;
          case ']':
          case '}':
            buffer2.brackets.pop();
            buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1] === '[';
            break;
          case ',':
            if (tokenFollowed(buffer).type === 'colon') break;
            buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1] === '[';
            break;
          case ':':
            normalToken.type = 'colon';
            buffer2.isValue = true;
            break;
          // no default
        }
        break;
      case 'delimiter':
        normalToken.type = buffer2.isValue ? 'string' : 'key';
        if (!buffer2.stringOpen) {
          buffer2.stringOpen = normalToken.string;
          break;
        }
        if (i > 0) {
          const previousToken = buffer.tokens_fallback[i - 1];
          const _string = previousToken.string;
          const _type = previousToken.type;
          const _char = _string.charAt(_string.length - 1);
          if (_type === 'string' && _char === '\\') break;
        }
        if (buffer2.stringOpen === normalToken.string) {
          buffer2.stringOpen = false;
          break;
        }
        break;
      case 'primitive':
      case 'string':
        if (['false', 'true', 'null', 'undefined'].indexOf(normalToken.string) > -1) {
          const lastIndex = buffer.tokens_normalize.length - 1;
          if (lastIndex >= 0) {
            if (buffer.tokens_normalize[lastIndex].type !== 'string') {
              normalToken.type = 'primitive';
              break;
            }
            normalToken.type = 'string';
            break;
          }
          normalToken.type = 'primitive';
          break;
        }
        if (normalToken.string === '\n') {
          if (!buffer2.stringOpen) {
            normalToken.type = 'linebreak';
            break;
          }
        }
        normalToken.type = buffer2.isValue ? 'string' : 'key';
        break;
      case 'space':
        if (buffer2.stringOpen) {
          normalToken.type = buffer2.isValue ? 'string' : 'key';
        }
        break;
      case 'number':
        if (buffer2.stringOpen) {
          normalToken.type = buffer2.isValue ? 'string' : 'key';
        }
        break;
      // no default
    }
    return normalToken;
  });

  for (let i = 0; i < buffer.tokens_normalize.length; i++) {
    const token = buffer.tokens_normalize[i];
    const mergedToken = {
      string: token.string,
      type: token.type,
      tokens: [i]
    };

    if (['symbol', 'colon'].indexOf(token.type) === -1 && i + 1 < buffer.tokens_normalize.length) {
      let count = 0;
      for (let u = i + 1; u < buffer.tokens_normalize.length; u++) {
        const nextToken = buffer.tokens_normalize[u];
        if (token.type !== nextToken.type) {
          break;
        }
        mergedToken.string += nextToken.string;
        mergedToken.tokens.push(u);
        count+=1;
      }
      i += count;
    }
    buffer.tokens_merge.push(mergedToken);
  }

  const quotes = '\'"';
  const alphanumeric = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$';

  let error = false;
  let line = buffer.tokens_merge.length > 0 ? 1 : 0;

  const setError = (tokenID, reason, offset = 0) => {
    error = {
      token: tokenID,
      line,
      reason
    };
    buffer.tokens_merge[tokenID + offset].type = 'error';
  };

  const bracketList = [];

  // Break apart loop??
  for (let i = 0; i < buffer.tokens_merge.length; i++) {
    if (error) {
      break;
    }
    const token = buffer.tokens_merge[i];
    let found = false;
    let { string, type } = token;

    switch (type) {
      case 'space':
        break;
      case 'linebreak':
        line+=1;
        break;
      case 'symbol':
        switch (string) {
          case '{':
          case '[':
            found = followsSymbol(buffer.tokens_merge, i, ['}', ']']);
            if (found) {
              setError(i, format(locale.invalidToken.tokenSequence.prohibited, {
                firstToken: buffer.tokens_merge[found].string,
                secondToken: string
              }));
              break;
            } else if (string === '[' && i > 0) {
              if (!followsSymbol(buffer.tokens_merge, i, [':', '[', ','])) {
                setError(i, format(locale.invalidToken.tokenSequence.permitted, {
                  firstToken: '[',
                  secondToken: [':', '[', ',']
                }));
                break;
              }
            } else if (string === '{') {
              if (followsSymbol(buffer.tokens_merge, i, ['{'])) {
                setError(i, format(locale.invalidToken.double, {
                  token: '{'
                }));
                break;
              }
            }
            buffer2.brackets.push(string);
            buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1] === '[';
            bracketList.push({
              i,
              line,
              string
            });
            break;
          case '}':
          case ']':
            if (string === '}') {
              if (buffer2.brackets[buffer2.brackets.length - 1] !== '{') {
                setError(i, format(locale.brace.curly.missingOpen));
                break;
              } else if (followsSymbol(buffer.tokens_merge, i, [','])) {
                setError(i, format(locale.invalidToken.tokenSequence.prohibited, {
                  firstToken: ',',
                  secondToken: '}'
                }));
                break;
              }
            } else if (string === ']') {
              if (buffer2.brackets[buffer2.brackets.length - 1] !== '[') {
                setError(i, format(locale.brace.square.missingOpen));
                break;
              } else if (followsSymbol(buffer.tokens_merge, i, [':'])) {
                setError(i, format(locale.invalidToken.tokenSequence.prohibited, {
                  firstToken: ':',
                  secondToken: ']'
                }));
                break;
              }
            }
            buffer2.brackets.pop();
            buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1] === '[';
            bracketList.push({
              i,
              line,
              string
            });
            break;
          case ',':
            found = followsSymbol(buffer.tokens_merge, i, ['{']);
            if (found) {
              if (followedBySymbol(buffer.tokens_merge, i, ['}'])) {
                setError(i, format(locale.brace.curly.cannotWrap, {
                  token: ','
                }));
                break;
              }
              setError(i, format(locale.invalidToken.tokenSequence.prohibited, {
                firstToken: '{',
                secondToken: ','
              }));
              break;
            } else if (followedBySymbol(buffer.tokens_merge, i, ['}', ',', ']'])) {
              setError(i, format(locale.noTrailingOrLeadingComma));
              break;
            }
            found = typeFollowed(buffer.tokens_merge, i);
            switch (found) {
              case 'key':
              case 'colon':
                setError(i, format(locale.invalidToken.termSequence.prohibited, {
                  firstTerm: found === 'key' ? locale.types.key : locale.symbols.colon,
                  secondTerm: locale.symbols.comma
                }));
                break;
              case 'symbol':
                if (followsSymbol(buffer.tokens_merge, i, ['{'])) {
                  setError(i, format(locale.invalidToken.tokenSequence.prohibited, {
                    firstToken: '{',
                    secondToken: ','
                  }));
                  break;
                }
                break;
              // no default
            }
            buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1] === '[';
            break;
          // no default
        }
        buffer.json += string;
        break;
      case 'colon':
        found = followsSymbol(buffer.tokens_merge, i, ['[']);
        if (found && followedBySymbol(buffer.tokens_merge, i, [']'])) {
          setError(i, format(locale.brace.square.cannotWrap, {
            token: ':'
          }));
          break;
        }
        if (found) {
          setError(i, format(locale.invalidToken.tokenSequence.prohibited, {
            firstToken: '[',
            secondToken: ':'
          }));
          break;
        }
        if (typeFollowed(buffer.tokens_merge, i) !== 'key') {
          setError(i, format(locale.invalidToken.termSequence.permitted, {
            firstTerm: locale.symbols.colon,
            secondTerm: locale.types.key
          }));
          break;
        }
        if (followedBySymbol(buffer.tokens_merge, i, ['}', ']'])) {
          setError(i, format(locale.invalidToken.termSequence.permitted, {
            firstTerm: locale.symbols.colon,
            secondTerm: locale.types.value
          }));
          break;
        }
        buffer2.isValue = true;
        buffer.json += string;
        break;
      case 'key':
      case 'string':
        const firstChar = string.charAt(0);
        const lastChar = string.charAt(string.length - 1);
        if (quotes.indexOf(firstChar) === -1 && quotes.indexOf(lastChar) !== -1) {
          setError(i, format(locale.string.missingOpen, {
            quote: firstChar
          }));
          break;
        }
        if (quotes.indexOf(lastChar) === -1 && quotes.indexOf(firstChar) !== -1) {
          setError(i, format(locale.string.missingClose, {
            quote: firstChar
          }));
          break;
        }
        if (quotes.indexOf(firstChar) > -1 && firstChar !== lastChar) {
          setError(i, format(locale.string.missingClose, {
            quote: firstChar
          }));
          break;
        }
        if (type === 'string' && quotes.indexOf(firstChar) === -1 && quotes.indexOf(lastChar) === -1) {
          setError(i, format(locale.string.mustBeWrappedByQuotes));
          break;
        }
        if (type === 'key' && followedBySymbol(buffer.tokens_merge, i, ['}', ']'])) {
          setError(i, format(locale.invalidToken.termSequence.permitted, {
            firstTerm: locale.types.key,
            secondTerm: locale.symbols.colon
          }));
        }
        if (quotes.indexOf(firstChar) === -1 && quotes.indexOf(lastChar) === -1) {
          for (let h = 0; h < string.length; h++) {
            if (error) {
              break;
            }
            const c = string.charAt(h);
            if (alphanumeric.indexOf(c) === -1) {
              setError(i, format(locale.string.nonAlphanumeric, {
                token: c
              }));
              break;
            }
          }
        }

        string = `"${firstChar === "'" ? string.slice(1, -1) : string}"`;
        if (type === 'key') {
          if (typeFollowed(buffer.tokens_merge, i) === 'key') {
            if (i > 0 && !Number.isNaN(Number(buffer.tokens_merge[i - 1]))) {
              buffer.tokens_merge[i - 1] += buffer.tokens_merge[i];
              setError(i, format(locale.key.numberAndLetterMissingQuotes));
              break;
            }
            setError(i, format(locale.key.spaceMissingQuotes));
            break;
          }
          if (!followsSymbol(buffer.tokens_merge, i, ['{', ','])) {
            setError(i, format(locale.invalidToken.tokenSequence.permitted, {
              firstToken: type,
              secondToken: ['{', ',']
            }));
            break;
          }
          if (buffer2.isValue) {
            setError(i, format(locale.string.unexpectedKey));
            break;
          }
        }
        if (type === 'string') {
          if (!followsSymbol(buffer.tokens_merge, i, ['[', ':', ','])) {
            setError(i, format(locale.invalidToken.tokenSequence.permitted, {
              firstToken: type,
              secondToken: ['[', ':', ',']
            }));
            break;
          }
          if (!buffer2.isValue) {
            setError(i, format(locale.key.unexpectedString));
            break;
          }
        }
        buffer.json += string;
        break;
      case 'number':
      case 'primitive':
        if (followsSymbol(buffer.tokens_merge, i, ['{'])) {
          buffer.tokens_merge[i].type = 'key';
          type = buffer.tokens_merge[i].type;
          string = `"${string}"`;
        } else if (typeFollowed(buffer.tokens_merge, i) === 'key') {
          buffer.tokens_merge[i].type = 'key';
          type = buffer.tokens_merge[i].type;
        } else if (!followsSymbol(buffer.tokens_merge, i, ['[', ':', ','])) {
          setError(i, format(locale.invalidToken.tokenSequence.permitted, {
            firstToken: type,
            secondToken: ['[', ':', ',']
          }));
          break;
        }
        if (type !== 'key' && !buffer2.isValue) {
          buffer.tokens_merge[i].type = 'key';
          type = buffer.tokens_merge[i].type;
          string = `"${string}"`;
        }
        if (type === 'primitive' && string === 'undefined') {
          setError(i, format(locale.invalidToken.useInstead, {
            badToken: 'undefined',
            goodToken: 'null'
          }));
        }
        buffer.json += string;
        break;
      // no default
    }
  }

  let noEscapedSingleQuote = '';

  for (let i = 0; i < buffer.json.length; i++) {
    const current = buffer.json.charAt(i);
    const next = buffer.json.charAt(i + 1) || '';

    if (i + 1 < buffer.json.length) {
      if (current === '\\' && next === "'") {
        noEscapedSingleQuote += next;
        i+=1;
        // eslint-disable-next-line no-continue
        continue;
      }
    }
    noEscapedSingleQuote += current;
  }

  buffer.json = noEscapedSingleQuote;

  if (!error) {
    const maxIterations = Math.ceil(bracketList.length / 2);
    let round = 0;
    let delta = false;

    const removePair = index => {
      bracketList.splice(index + 1, 1);
      bracketList.splice(index, 1);
      if (!delta) {
        delta = true;
      }
    };

    while (bracketList.length > 0) {
      delta = false;
      for (let tokenCount = 0; tokenCount < bracketList.length - 1; tokenCount++) {
        const pair = bracketList[tokenCount].string + bracketList[tokenCount + 1].string;
        if (['[]', '{}'].indexOf(pair) > -1) {
          removePair(tokenCount);
        }
      }
      round+=1;
      if (!delta) {
        break;
      }
      if (round >= maxIterations) {
        break;
      }
    }

    if (bracketList.length > 0) {
      const _tokenString = bracketList[0].string;
      const _tokenPosition = bracketList[0].i;
      const _closingBracketType = _tokenString === '[' ? ']' : '}';
      line = bracketList[0].line;
      setError(_tokenPosition, format(locale.brace[_closingBracketType === ']' ? 'square' : 'curly'].missingClose));
    }

    if ([undefined, ''].indexOf(buffer.json) === -1) {
      try {
        buffer.jsObject = JSON.parse(buffer.json);
      } catch (err) {
        const errorMessage = err.message;
        const subsMark = errorMessage.indexOf('position');

        if (subsMark === -1) {
          throw new Error('Error parsing failed');
        }

        const errPositionStr = errorMessage.substring(subsMark + 9, errorMessage.length);
        const errPosition = parseInt(errPositionStr, 10);

        let charTotal = 0;
        let tokenIndex = 0;
        let token = false;
        let _line = 1;
        let exitWhile = false;

        while (charTotal < errPosition && !exitWhile) {
          token = buffer.tokens_merge[tokenIndex];
          if (token.type === 'linebreak') {
            _line+=1;
          }
          if (['space', 'linebreak'].indexOf(token.type) === -1) {
            charTotal += token.string.length;
          }
          if (charTotal >= errPosition) {
            break;
          }
          tokenIndex+=1;
          if (!buffer.tokens_merge[tokenIndex + 1]) {
            exitWhile = true;
          }
        }

        line = _line;
        let backslashCount = 0;

        for (let i = 0; i < token.string.length; i++) {
          const char = token.string.charAt(i);
          if (char === '\\') {
            backslashCount = backslashCount > 0 ? backslashCount + 1 : 1;
          } else {
            if (backslashCount % 2 !== 0 || backslashCount === 0) {
              if ('\'"bfnrt'.indexOf(char) === -1) {
                setError(tokenIndex, format(locale.invalidToken.unexpected, {
                  token: '\\'
                }));
              }
            }
            backslashCount = 0;
          }
        }
        if (!error) {
          setError(tokenIndex, format(locale.invalidToken.unexpected, {
            token: token.string
          }));
        }
      }
    }
  }

  let _line = 1;
  let _depth = 0;
  const lastIndex = buffer.tokens_merge.length - 1;
  const newIndent = () => Array(_depth * 2).fill('&nbsp;').join('');

  const newLineBreak = (byPass = false) => {
    _line+=1;
    return (_depth > 0 || byPass) ? '<br>' : '';
  };

  const newLineBreakAndIndent = (byPass = false) => newLineBreak(byPass) + newIndent();

  if (error) {
    let _lineFallback = 1;
    const countCarrigeReturn = string => {
      let count = 0;
      for (let i = 0; i < string.length; i++) {
        if (['\n', '\r'].indexOf(string[i]) > -1) count+=1;
      }
      return count;
    };

    _line = 1;
    for (let i = 0; i < buffer.tokens_merge.length; i++) {
      const token = buffer.tokens_merge[i];
      const { type, string } = token;
      if (type === 'linebreak') {
        _line+=1;
      }

      buffer.markup += newSpan(i, token, _depth, colors);
      _lineFallback += countCarrigeReturn(string);
    }
    _line+=1;
    _lineFallback+=1;
    if (_line < _lineFallback) {
      _line = _lineFallback;
    }
  } else {
    // FORMAT BY TOKEN!!
    // TODO: Simplify this....
    for (let i = 0; i < buffer.tokens_merge.length; i++) {
      const token = buffer.tokens_merge[i];
      switch (token.type) {
        case 'string':
        case 'number':
        case 'primitive':
        case 'error':
          // buffer.markup += followsSymbol(buffer.tokens_merge, i, [',', '[']) ? newLineBreakAndIndent() : '';
          buffer.markup += newSpan(i, token, _depth, colors);
          break;
        case 'key':
          buffer.markup += (newLineBreakAndIndent() + newSpan(i, token, _depth, colors));
          break;
        case 'colon':
          buffer.markup += `${newSpan(i, token, _depth, colors)}&nbsp;`;
          break;
        case 'symbol':
          const islastToken = i === lastIndex;
          switch (token.string) {
            case '{':
              buffer.markup += newSpan(i, token, _depth, colors);
              _depth+=1;
              break;
            case '}':
              _depth = _depth > 0 ? _depth - 1 : _depth;
              let _adjustment = '';
              if (i > 0) _adjustment = followsSymbol(buffer.tokens_merge, i, ['[', '{']) ? '' : newLineBreakAndIndent(islastToken);

              buffer.markup += _adjustment + newSpan(i, token, _depth, colors);
              break;
            case '[':
              if (followsSymbol(buffer.tokens_merge, i, ['['])) {
                _depth+=1;
                buffer.markup += newLineBreakAndIndent();
              }
              buffer.markup += newSpan(i, token, _depth, colors);
              break;
            case ']':
              const tmpToken = { ...token };
              let indBool = false;

              if (followsSymbol(buffer.tokens_merge, i, [']'])) {
                if (followedBySymbol(buffer.tokens_merge, i, [']'])) {
                  if (followedBySymbol(buffer.tokens_merge, i + 1, [','])) {
                    _depth = _depth >= 1 ? _depth - 1 : _depth;
                    indBool = true;
                    i+=1;
                  } else if (followedBySymbol(buffer.tokens_merge, i + 1, [']'])) {
                    _depth = _depth >= 1 ? _depth - 1 : _depth;
                    indBool = true;
                  }
                } else if (followedBySymbol(buffer.tokens_merge, i, ['}'])) {
                  _depth = _depth >= 1 ? _depth - 1 : _depth;
                  indBool = true;
                }
              }

              buffer.markup += (indBool ? newLineBreakAndIndent() : '') + newSpan(i, tmpToken, _depth, colors);
              break;
            case ',':
              buffer.markup += newSpan(i, token, _depth, colors);
              if (followsSymbol(buffer.tokens_merge, i, [']']) && followedBySymbol(buffer.tokens_merge, i, ['['])) {
                buffer.markup += newLineBreakAndIndent();
              }
              break;
            default:
              buffer.markup += newSpan(i, token, _depth, colors);
              break;
          }
          break;
        // no default
      }
    }
  }

  for (let i = 0; i < buffer.tokens_merge.length; i++) {
    const token = buffer.tokens_merge[i];
    buffer.indented += token.string;
    if (['space', 'linebreak'].indexOf(token.type) === -1) {
      buffer.tokens_plainText += token.string;
    }
  }

  return {
    tokens: buffer.tokens_merge,
    noSpaces: buffer.tokens_plainText,
    indented: buffer.indented,
    json: buffer.json,
    jsObject: buffer.jsObject,
    markup: buffer.markup,
    lines: _line,
    error
  };
};

// JS OBJECTS || PLACEHOLDER
// Helper Functions
const stringHasQuotes = s => s.match(/^['"].*["']$/);

const stringMayRemoveQuotes = (nonAlphaNumeric, text) => {
  let numberAndLetter = false;

  for (let i = 0; i < text.length; i++) {
    if (i === 0 && Number.isNaN(Number(text.charAt(i)))) {
      break;
    }
    if (Number.isNaN(Number(text.charAt(i)))) {
      numberAndLetter = true;
      break;
    }
  }
  return !(nonAlphaNumeric.length > 0 || numberAndLetter);
};

const stripQuotesFromKey = text => {
  if (text.length === 0) return text;
  if (['""', "''"].indexOf(text) > -1) return "''";
  let wrappedInQuotes = false;

  if (text.match(/^['"].*["']$/)) {
    wrappedInQuotes = true;
  }

  if (wrappedInQuotes && text.length >= 2) text = text.slice(1, -1);
  const nonAlphaNumeric = text.replace(/\w/g, '');
  const mayRemoveQuotes = stringMayRemoveQuotes(nonAlphaNumeric, text);
  const hasQuotes = stringHasQuotes(nonAlphaNumeric);

  if (hasQuotes) {
    let newText = '';
    const charList = text.split('');
    for (let ii = 0; ii < charList.length; ii++) {
      let char = charList[ii];
      if (["'", '"'].indexOf(char) > -1) char = `\${char}`;
      newText += char;
    }
    text = newText;
  }
  return mayRemoveQuotes ? text : `'${text}'`;
};

const addTokenSecondary = buffer => {
  if (buffer.tokenSecondary.length === 0) return false;
  buffer.tokens.push(buffer.tokenSecondary);
  buffer.tokenSecondary = '';
  return true;
};

const addTokenPrimary = (buffer, value) => {
  if (value.length === 0) return false;
  buffer.tokens.push(value);
  return true;
};

const escapeCharacter = buffer => {
  if (buffer.currentChar !== '\\') return false;
  buffer.inputText = deleteCharAt(buffer.inputText, buffer.position);
  return true;
};

const determineString = buffer => {
  if ('\'"'.indexOf(buffer.currentChar) === -1) return false;
  if (!buffer.stringOpen) {
    addTokenSecondary(buffer);
    buffer.stringStart = buffer.position;
    buffer.stringOpen = buffer.currentChar;
    return true;
  }

  if (buffer.stringOpen === buffer.currentChar) {
    addTokenSecondary(buffer);
    const stringToken = buffer.inputText.substring(buffer.stringStart, buffer.position + 1);
    addTokenPrimary(buffer, stringToken);
    buffer.stringOpen = false;
    return true;
  }
  return false;
};

const determineValue = buffer => {
  if (':,{}[]'.indexOf(buffer.currentChar) === -1 || buffer.stringOpen) return false;
  addTokenSecondary(buffer);
  addTokenPrimary(buffer, buffer.currentChar);

  switch (buffer.currentChar) {
    case ':':
      buffer.isValue = true;
      return true;
    case '{':
    case '[':
      buffer.brackets.push(buffer.currentChar);
      break;
    case '}':
    case ']':
      buffer.brackets.pop();
      break;
    // no default
  }

  if (buffer.currentChar !== ':') {
    buffer.isValue = buffer.brackets[buffer.brackets.length - 1] === '[';
  }
  return true;
};

// Main Function
// eslint-disable-next-line camelcase
export const JSON_Placeholder = (obj, colors) => {
  const buffer = {
    inputText: JSON.stringify(obj),
    position: 0,
    currentChar: '',
    tokenPrimary: '',
    tokenSecondary: '',
    brackets: [],
    isValue: false,
    stringOpen: false,
    stringStart: 0,
    tokens: []
  };

  buffer.inputText.split('').forEach((char, i) => {
    buffer.position = i;
    buffer.currentChar = char;

    if (!determineValue(buffer) && !determineString(buffer) && !escapeCharacter(buffer)) {
      if (!buffer.stringOpen) {
        buffer.tokenSecondary += buffer.currentChar;
      }
    }
  });

  const buffer2 = {
    brackets: [],
    isValue: false,
    tokens: []
  };

  // eslint-disable-next-line array-callback-return
  buffer2.tokens = buffer.tokens.map(token => {
    switch (token) {
      case ',':
        buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1] === '[';
        return {
          type: 'symbol',
          string: token,
          value: token,
          depth: buffer2.brackets.length
        };
      case ':':
        buffer2.isValue = true;
        return {
          type: 'symbol',
          string: token,
          value: token,
          depth: buffer2.brackets.length
        };
      case '{':
      case '[':
        buffer2.brackets.push(token);
        buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1] === '[';
        return {
          type: 'symbol',
          string: token,
          value: token,
          depth: buffer2.brackets.length
        };
      case '}':
      case ']':
        buffer2.brackets.pop();
        buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1] === '[';
        return {
          type: 'symbol',
          string: token,
          value: token,
          depth: buffer2.brackets.length
        };
      case 'undefined':
        return {
          type: 'primitive',
          string: token,
          value: undefined,
          depth: buffer2.brackets.length
        };
      case 'null':
        return {
          type: 'primitive',
          string: token,
          value: null,
          depth: buffer2.brackets.length
        };
      case 'false':
        return {
          type: 'primitive',
          string: token,
          value: false,
          depth: buffer2.brackets.length
        };
      case 'true':
        return {
          type: 'primitive',
          string: token,
          value: true,
          depth: buffer2.brackets.length
        };
      default:
        const C = token.charAt(0);
        const rtn = {
          type: '',
          string: '',
          value: '',
          depth: buffer2.brackets.length
        };

        if ('\'"'.indexOf(C) > -1) {
          rtn.type = buffer2.isValue ? 'string' : 'key';
          if (rtn.type === 'key') rtn.string = stripQuotesFromKey(token);
          if (rtn.type === 'string') {
            rtn.string = '';
            const charList2 = token.slice(1, -1).split('');
            for (let ii = 0; ii < charList2.length; ii++) {
              let char = charList2[ii];
              if ('\'"'.indexOf(char) > -1) char = `\${char}`;
              rtn.string += char;
            }
            rtn.string = `'${rtn.string}'`;
          }
          rtn.value = rtn.string;
          return rtn;
        }

        if (!Number.isNaN(Number(token))) {
          rtn.type = 'number';
          rtn.string = token;
          rtn.value = Number(token);
          return rtn;
        }

        if (rtn.token.length > 0 && !buffer2.isValue) {
          rtn.type = 'key';
          rtn.string = token;
          if (rtn.string.indexOf(' ') > -1) rtn.string = `'${rtn.string}'`;
          rtn.value = rtn.string;
          return rtn;
        }
    }
  });

  const clean = buffer2.tokens.map(t => t.string).join('');

  let _line = 1;
  let _depth = 0;
  let indentation = '';
  let markup = '';
  const lastIndex = buffer2.tokens.length - 1;

  const indent = (byPass = false) => ((_depth > 0 || byPass) ? '\n' : '') + Array(_depth * 2).fill(' ').join('');

  const indentII = (byPass = false) => {
    if (_depth > 0) _line+=1;
    return ((_depth > 0 || byPass) ? '<br>' : '') + Array(_depth * 2).fill('&nbsp;').join('');
  };

  // FORMAT BY TOKEN!!
  buffer2.tokens.forEach((token, i) => {
    switch (token.type) {
      case 'string':
      case 'number':
        indentation += token.string;
        markup += newSpan(i, token, _depth, colors);
        break;
      case 'key':
        indentation += indent() + token.string;
        markup += indentII() + newSpan(i, token, _depth, colors);
        break;
      case 'symbol':
        const islastToken = i === lastIndex;
        switch (token.string) {
          case '{':
            indentation += token.string;
            markup += newSpan(i, token, _depth, colors);
            _depth+=1;
            if (followedBySymbol(buffer2.tokens, i, ['}'])) {
              indentation += indent();
              markup += indentII();
            }
            break;
          case '}':
            _depth = _depth >= 1 ? _depth - 1 : _depth;
            let _adjustment = '';
            let _adjustmentII = '';
            if (i > 0 && !followsSymbol(buffer2.tokens, i, ['[', '{'])) {
              _adjustment = indent(islastToken);
              _adjustmentII = indentII(islastToken);
            }

            indentation += _adjustment + token.string;
            markup += _adjustmentII + newSpan(i, token, _depth, colors);
            break;
          case '[':
            if (followsSymbol(buffer2.tokens, i, ['['])) {
              _depth+=1;
              indentation += indent();
              markup += indentII();
            }
            indentation += token.string;
            markup += newSpan(i, token, _depth, colors);
            break;
          case ']':
            const tmpToken = { ...token };
            let indBool = false;

            if (followsSymbol(buffer2.tokens, i, [']'])) {
              if (followedBySymbol(buffer2.tokens, i, [']'])) {
                if (followedBySymbol(buffer2.tokens, i + 1, [','])) {
                  _depth = _depth >= 1 ? _depth - 1 : _depth;
                  indBool = true;
                  i+=1;
                } else if (followedBySymbol(buffer2.tokens, i + 1, [']'])) {
                  _depth = _depth >= 1 ? _depth - 1 : _depth;
                  indBool = true;
                }
              } else if (followedBySymbol(buffer2.tokens, i, ['}'])) {
                _depth = _depth >= 1 ? _depth - 1 : _depth;
                indBool = true;
              }
            }

            indentation += (indBool ? indent() : '') + tmpToken.string;
            markup += (indBool ? indentII() : '') + newSpan(i, tmpToken, _depth, colors);
            break;
          case ':':
            indentation += `${token.string} `;
            markup += `${newSpan(i, token, _depth, colors)}&nbsp;`;
            break;
          case ',':
            indentation += token.string;
            markup += newSpan(i, token, _depth, colors);
            if (followsSymbol(buffer2.tokens, i, [']']) && followedBySymbol(buffer2.tokens, i, ['['])) {
              indentation += indent();
              markup += indentII();
            }
            break;
          default:
            indentation += token.string;
            markup += newSpan(i, token, _depth, colors);
            break;
        }
        break;
      // no default
    }
  });
  _line += 1;

  return {
    tokens: buffer2.tokens,
    noSpaces: clean,
    indented: indentation,
    json: JSON.stringify(obj),
    jsObject: obj,
    markup,
    lines: _line
  };
};
