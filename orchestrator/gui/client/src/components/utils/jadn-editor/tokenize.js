import { format } from './locale'; // direct copy
import defaultLocale from './locale/en'; // direct copy

import {
    deleteCharAt,
    followedBySymbol,
    followsSymbol,
    newSpan,
    typeFollowed
} from './utils'


// DOM Node || OnBlue or Update
// Helper Functions
const finalPush = (buffer, prefix='') => {
    if (buffer.active) {
	    buffer.quarks.push({
            string: buffer[buffer.active],
            type: prefix + '-' + buffer.active
        });
        buffer[buffer.active] = '';
        buffer.active = false;
	}
}

const pushAndStore = (buffer, char, type, prefix='') => {
	switch(type) {
		case 'symbol':
		case 'delimiter':
			if (buffer.active) {
				buffer.quarks.push({
					string: buffer[buffer.active],
					type: prefix + '-' + buffer.active
				});
			}
			buffer[buffer.active] = '';
			buffer.active = type;
			buffer[buffer.active] = char;
			break;
		default:
			if (type !== buffer.active || ([buffer.string, char].indexOf('\n') > -1)) {
				if (buffer.active) {
					buffer.quarks.push({
						string: buffer[buffer.active],
						type: prefix + '-' + buffer.active
					});
				}
				buffer[buffer.active] = '';
				buffer.active  = type;
				buffer[buffer.active] = char;
			} else{
				buffer[type] += char;
			}
			break;
	}
}

const quarkize = (text, prefix='') => {
		let buffer = {
			active: false,
			string: '',
			number: '',
			symbol: '',
			space: '',
			delimiter: '',
			quarks: []
		};

		text.split('').forEach((char, i) => {
			switch(char) {
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
					pushAndStore(buffer, char, buffer.active === 'string' ? 'string' : 'number', prefix);
					break;
				case '-':
					if (i < text.length - 1 && '0123456789'.indexOf(text.charAt(i + 1)) > -1){
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
		})
		finalPush(buffer, prefix);
		return buffer.quarks;
	}

const validToken = (string, type) => {
	const quotes = '\'"';
	let firstChar = '',
		lastChar = '',
		quoteType = false;
	
	switch(type) {
		case 'primitive':
			if (['true','false','null','undefined'].indexOf(string) === -1) { return false }
			break;
		case 'string':
			if (string.length < 2) { return false }
			firstChar = string.charAt(0),
				lastChar = string.charAt(string.length-1),
				quoteType = quotes.indexOf(firstChar);
			if (quoteType === -1 || firstChar !== lastChar) { return false }
			for (var i = 0; i < string.length; i++) {
				if (i > 0 && i < string.length - 1 && string.charAt(i) === quotes[quoteType] && string.charAt(i - 1) !== '\\') { return false }
			}
			break;
		case 'key':
			if (string.length === 0) { return false }
			firstChar = string.charAt(0),
				lastChar = string.charAt(string.length-1),
				quoteType = quotes.indexOf(firstChar);
			if (quoteType > -1) {
				if (string.length===1 || firstChar !== lastChar) { return false }
				for (var i = 0; i < string.length; i++) {
					if (i > 0 && i < string.length - 1 && string.charAt(i)===quotes[quoteType] && string.charAt(i - 1) !== '\\'){ return false }
				}
			} else {
				const nonAlphanumeric = '\'"`.,:;{}[]&<>=~*%\\|/-+!?@^ \xa0';
				for (var i = 0; i < nonAlphanumeric.length; i++) {
					const nonAlpha = nonAlphanumeric.charAt(i);
					if (string.indexOf(nonAlpha) > -1) { return false }
				}
			}
			break;
		case 'number':
			for (var i = 0; i < string.length ; i++) {
				if ('0123456789'.indexOf(string.charAt(i)) === -1 && i === 0) {
					if ('-' !== string.charAt(0)) { return false }
				} else if ('.' !== string.charAt(i)) { return false }
			}
			break;
		case 'symbol':
			if (string.length > 1 || '{[:]},'.indexOf(string) === -1) { return false }
			break;
		case 'colon':
			if (string.length > 1 || ':' !== string) { return false }
			break;
		default:
			return true;
			break;
     }
	return true;
}

const tokenFollowed = (buffer) => {
	const last = buffer.tokens_normalize.length - 1;
	if (last < 1) { return false }

	for (var i = last; i >= 0; i--) {
		const previousToken = buffer.tokens_normalize[i];
		switch(previousToken.type) {
			case 'space':
			case 'linebreak':
				break;
			default:
				return previousToken;
				break;
        }
	}
	return false;
}

// Main Function
export const DomNode_Update = (obj, locale=defaultLocale, colors) => {
	const containerNode = obj.cloneNode(true),
		  hasChildren   = containerNode.hasChildNodes();

	if (!hasChildren) { return '' }
	const children = containerNode.childNodes;

	let buffer = {
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
	}

	children.forEach((child, i) => {
	    switch(child.nodeName) {
			case 'SPAN':
				buffer.tokens_unknown.push({
					string: child.textContent,
					type: child.attributes.type.textContent
				});
				break;
			case 'DIV':
				buffer.tokens_unknown.push({ string : child.textContent, type : 'unknown' });
				break;
			case 'BR' :
				if (child.textContent==='') {
					buffer.tokens_unknown.push({ string : '\n', type : 'unknown' });
				}
				break;
			case '#text':
				buffer.tokens_unknown.push({ string : child.wholeText, type : 'unknown' });
				break;
			case 'FONT':
				buffer.tokens_unknown.push({ string : child.textContent, type : 'unknown' });
				break;
			default:
				console.error('Unrecognized node:', { child })
				break;
		}
	})

	buffer.tokens_proto = buffer.tokens_unknown.map(token => quarkize(token.string, 'proto')).reduce((all, quarks) => all.concat(quarks))

	buffer.tokens_proto.forEach(token => {
		if (token.type.indexOf('proto') === -1) {
			if (!validToken(token.string,token.type)) {
				buffer.tokens_split = buffer.tokens_split.concat(quarkize(token.string, 'split'));
			} else {
				buffer.tokens_split.push(token);
			}
		} else {
			buffer.tokens_split.push(token);
		}
	})

	buffer.tokens_fallback = buffer.tokens_split.map(token => {
	    let type = token.type,
	        fallback = [];

	    if (type.indexOf('-') > -1) {
			type = type.slice(type.indexOf('-') + 1);
			if (type !== 'string') { fallback.push('string') }
            fallback.push('key');
			fallback.push('error');
		}

	    return {
			string: token.string,
			length: token.string.length,
			type: type,
			fallback: fallback
		}
	})

	let buffer2 = {
		brackets: [],
		isValue: false,
		stringOpen: false
	};


    buffer.tokens_normalize = buffer.tokens_fallback.map((token, i) => {
        let normalToken = {
			type: token.type,
			string: token.string
		};

		switch(normalToken.type) {
			case 'symbol':
			case 'colon':
				if (buffer2.stringOpen) {
					normalToken.type = buffer2.isValue ? 'string' : 'key'
					break;
				}
				switch(normalToken.string) {
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
               	}
				break;
			case 'delimiter':
				normalToken.type = buffer2.isValue ? 'string' : 'key'
				if (!buffer2.stringOpen) {
					buffer2.stringOpen = normalToken.string;
					break;
				}
				if (i > 0) {
					const previousToken = buffer.tokens_fallback[i - 1],
						  _string = previousToken.string,
						  _type = previousToken.type,
						  _char = _string.charAt(_string.length - 1);
					if (_type === 'string' && _char === '\\') break;
				}
				if (buffer2.stringOpen === normalToken.string) {
					buffer2.stringOpen = false;
					break;
				}
				break;
			case 'primitive':
			case 'string':
				if (['false','true','null','undefined'].indexOf(normalToken.string) > -1) {
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
			default:
				break;
		}

        return normalToken
    })

	for (var i = 0; i < buffer.tokens_normalize.length; i++) {
		const token = buffer.tokens_normalize[i];
		let mergedToken = {
			string: token.string,
			type: token.type,
			tokens: [i]
		};

		if (['symbol', 'colon'].indexOf(token.type) === -1 && i + 1 < buffer.tokens_normalize.length) {
			let count = 0;
			for (var u = i + 1; u < buffer.tokens_normalize.length; u++) {
				const nextToken = buffer.tokens_normalize[u];
				if (token.type !== nextToken.type) { break }
				mergedToken.string += nextToken.string;
				mergedToken.tokens.push(u);
				count++;
			}
			i += count;
		}
		buffer.tokens_merge.push(mergedToken);
	}

	const quotes = '\'"',
		  alphanumeric = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$';
	
	var error = false,
		line  = buffer.tokens_merge.length > 0 ? 1 : 0;
	
	const setError = (tokenID, reason, offset=0) => {
		error = {
			token: tokenID,
			line: line,
			reason: reason
		};
		buffer.tokens_merge[tokenID + offset].type = 'error';
	}

	let bracketList = [];
	
	// Break apart??
	for (var i = 0; i < buffer.tokens_merge.length; i++) {
		if (error) { break }
        let token = buffer.tokens_merge[i],
			string = token.string,
			type = token.type,
			found = false;
		
		switch(type) {
			case 'space': break;
			case 'linebreak':
				line++;
				break;
			case 'symbol':
				switch(string) {
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
							if (!followsSymbol(buffer.tokens_merge, i ,[':', '[', ','])){
								setError(i, format(locale.invalidToken.tokenSequence.permitted, {
									firstToken: "[",
									secondToken: [":", "[", ","]
								}));
								break;
							}
						} else if (string === '{') {
							if (followsSymbol(buffer.tokens_merge, i, ['{'])) {
								setError(i, format(locale.invalidToken.double, {
									token: "{"
								}));
								break;
							}
						}
						buffer2.brackets.push(string);
						buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1] === '[';
						bracketList.push({
							i: i,
							line: line,
							string: string
						});
						break;
					case '}':
					case ']':
						if (string === '}') {
							if (buffer2.brackets[buffer2.brackets.length-1] !== '{'){
								setError(i, format(locale.brace.curly.missingOpen));
								break;
							} else if (followsSymbol(buffer.tokens_merge, i, [','])){
								setError(i, format(locale.invalidToken.tokenSequence.prohibited, {
									firstToken: ",",
									secondToken: "}"
								}));
								break;
							}
						} else if (string === ']') {
							if (buffer2.brackets[buffer2.brackets.length-1] !== '['){
								setError(i, format(locale.brace.square.missingOpen));
								break;
							} else if (followsSymbol(buffer.tokens_merge, i, [':'])){
								setError(i, format(locale.invalidToken.tokenSequence.prohibited, {
									firstToken: ":",
									secondToken: "]"
								}));
								break;
							}
						}
						buffer2.brackets.pop();
						buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1] === '[';
						bracketList.push({
							i: i,
							line: line,
							string: string
						});
						break;
					case ',':
						found = followsSymbol(buffer.tokens_merge, i, ['{']);
						if (found) {
							if (followedBySymbol(buffer.tokens_merge, i, ['}'])) {
								setError(i, format(locale.brace.curly.cannotWrap, {
									token: ","
								}));
								break;
							}
							setError(i, format(locale.invalidToken.tokenSequence.prohibited, {
								firstToken: "{",
								secondToken: ","
							}));
							break;
						} else if (followedBySymbol(buffer.tokens_merge, i, ['}', ',', ']'])) {
							setError(i, format(locale.noTrailingOrLeadingComma));
							break;
						}
						found = typeFollowed(buffer.tokens_merge, i);
						switch(found) {
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
										firstToken: "{",
										secondToken: ","
									}));
									break;
								}
								break;
							default: break;
						}
						buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1] === '[';
						break;
					default: break;
				}
				buffer.json += string;
				break;
			case 'colon':
				found = followsSymbol(buffer.tokens_merge, i, ['[']);
				if (found && followedBySymbol(buffer.tokens_merge, i, [']'])) {
					setError(i, format(locale.brace.square.cannotWrap, {
						token: ":"
					}));
					break;
				}
				if (found) {
					setError(i, format(locale.invalidToken.tokenSequence.prohibited, {
						firstToken: "[",
						secondToken: ":"
					}));
					break;
				}
				if (typeFollowed(buffer.tokens_merge, i) !== 'key'){
					setError(i, format(locale.invalidToken.termSequence.permitted, {
						firstTerm: locale.symbols.colon,
						secondTerm: locale.types.key
					}));
					break;
				}
				if (followedBySymbol(buffer.tokens_merge, i, ['}', ']'])){
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
				let firstChar = string.charAt(0),
					lastChar = string.charAt(string.length - 1),
					quote_primary = quotes.indexOf(firstChar);
				if (quotes.indexOf(firstChar) === -1 && quotes.indexOf(lastChar) !== -1) {
             		setError(i, format(locale.string.missingOpen, {
						quote: firstChar
					}));
					break;
				}
				if (quotes.indexOf(lastChar) === -1 && quotes.indexOf(firstChar) !== -1){
					setError(i,format(locale.string.missingClose, {
						quote: firstChar,
					}));
					break;
				}
				if (quotes.indexOf(firstChar) > -1 && firstChar !== lastChar) {
					setError(i,format(locale.string.missingClose, {
						quote: firstChar,
					}));
					break;
				}
				if ('string' === type && quotes.indexOf(firstChar) === -1 && quotes.indexOf(lastChar) === -1){
					setError(i,format(locale.string.mustBeWrappedByQuotes));
					break;
				}
                if ('key' === type && followedBySymbol(buffer.tokens_merge, i,['}',']'])){
					setError(i,format(locale.invalidToken.termSequence.permitted, {
						firstTerm: locale.types.key,
						secondTerm: locale.symbols.colon
					}));
				}
				if (quotes.indexOf(firstChar)===-1 && quotes.indexOf(lastChar) === -1) {
					for (var h = 0; h < string.length; h++) {
						if (error) { break }
						const c = string.charAt(h);
						if (alphanumeric.indexOf(c) === -1){
							setError(i, format(locale.string.nonAlphanumeric, {
								token: c,
							}));
							break;
						}
					}
				}

				string = '"' + (firstChar === "'" ? string.slice(1,-1) : string) + '"';
				if ('key' === type) {
					if ('key' === typeFollowed(buffer.tokens_merge, i)) {
						if (i > 0 && !isNaN(buffer.tokens_merge[i-1])){
							buffer.tokens_merge[i-1] += buffer.tokens_merge[i];
							setError(i,format(locale.key.numberAndLetterMissingQuotes));
							break;
						}
						setError(i,format(locale.key.spaceMissingQuotes));
						break;
					}
					if (!followsSymbol(buffer.tokens_merge, i,['{', ','])){
						setError(i,format(locale.invalidToken.tokenSequence.permitted, {
							firstToken: type,
							secondToken: ["{", ","]
						}));
						break;
					}
					if (buffer2.isValue){
						setError(i, format(locale.string.unexpectedKey));
						break;
					}
				}
				if ('string' === type) {
					if (!followsSymbol(buffer.tokens_merge, i,['[', ':', ','])) {
						setError(i,format(locale.invalidToken.tokenSequence.permitted, {
							firstToken: type,
							secondToken: ["[", ":", ","]
						}));
						break;
					}
					if (!buffer2.isValue) {
						setError(i,format(locale.key.unexpectedString));
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
					string = '"' + string + '"';
				} else if (typeFollowed(buffer.tokens_merge, i) === 'key') {
					buffer.tokens_merge[i].type = 'key';
					type = buffer.tokens_merge[i].type;
				} else if (!followsSymbol(buffer.tokens_merge, i, ['[', ':', ','])) {
					setError(i,format(locale.invalidToken.tokenSequence.permitted, {
						firstToken: type,
						secondToken: ["[", ":", ","]
					}));
					break;
				}
				if (type !== 'key' && !buffer2.isValue){
					buffer.tokens_merge[i].type = 'key';
					type = buffer.tokens_merge[i].type;
					string = '"' + string + '"';
				}
				if (type === 'primitive' && string === 'undefined') {
					setError(i,format(locale.invalidToken.useInstead, {
						badToken: "undefined",
						goodToken: "null"
					}));
				}
				buffer.json += string;
				break;
        }
	}

	let noEscapedSingleQuote = '';

	for (var i = 0; i < buffer.json.length; i++) {
		let current = buffer.json.charAt(i),
			next = buffer.json.charAt(i+1) || '';
		if (i + 1 < buffer.json.length) {
			if (current === '\\' && next === "'"){
				noEscapedSingleQuote += next;
				i++;
				continue;
			}
		}
		noEscapedSingleQuote += current;
	}

	buffer.json = noEscapedSingleQuote;

	if (!error) {
		const maxIterations = Math.ceil(bracketList.length / 2);
		let round = 0,
			delta = false;
		
		const removePair = (index) => {
			bracketList.splice(index + 1,1);
			bracketList.splice(index, 1);
			if (!delta) {
				delta = true;
			}
		}
		
		while (bracketList.length > 0) {
			delta = false;
			for (var tokenCount = 0; tokenCount < bracketList.length - 1; tokenCount++) {
				const pair = bracketList[tokenCount].string + bracketList[tokenCount+1].string;
				if (['[]', '{}'].indexOf(pair) > -1){
					removePair(tokenCount);
				}
			}
			round++;
			if (!delta) {
				break;
			}
			if (round >= maxIterations) {
				break;
			}
		}
		if (bracketList.length > 0) {
			const _tokenString = bracketList[0].string,
				  _tokenPosition = bracketList[0].i,
				  _closingBracketType = _tokenString === '[' ? ']' : '}';
			line = bracketList[0].line;
			setError(_tokenPosition, format(locale.brace[_closingBracketType === ']' ? 'square' : 'curly'].missingClose));
		}
		if ([undefined, ''].indexOf(buffer.json) === -1) {
			try {
				buffer.jsObject = JSON.parse(buffer.json);
			} catch(err) {
				const errorMessage = err.message,
					  subsMark = errorMessage.indexOf('position');
				
				if (subsMark === -1) {
					throw new Error('Error parsing failed');
				}
				
				const errPositionStr = errorMessage.substring(subsMark + 9, errorMessage.length),
					  errPosition = parseInt(errPositionStr);
				
				let charTotal = 0,
					tokenIndex = 0,
					token = false,
					_line = 1,
					exitWhile = false;
				
				while (charTotal < errPosition && !exitWhile) {
					token = buffer.tokens_merge[tokenIndex];
					if ('linebreak'===token.type) {
						_line++;
					}
					if (['space','linebreak'].indexOf(token.type)===-1) {
						charTotal += token.string.length;
					}
					if (charTotal >= errPosition) {
						break;
					}
					tokenIndex++;
					if (!buffer.tokens_merge[tokenIndex+1]) {
						exitWhile = true;
					}
				}
				
				line = _line;
				let backslashCount = 0;
				
				for (let i = 0; i < token.string.length; i++) {
					const char = token.string.charAt(i);
					if (char==='\\') {
						backslashCount = backslashCount > 0 ? backslashCount + 1 : 1;
					} else {
						if (backslashCount % 2 !== 0 || backslashCount === 0) {
							if ('\'"bfnrt'.indexOf(char) === -1) {
								setError(tokenIndex,format(locale.invalidToken.unexpected, {
									token: '\\'
								}));
							}
						}
						backslashCount = 0;
					}
				}
				if (!error) {
					setError(tokenIndex,format(locale.invalidToken.unexpected, {
						token: token.string
					}));
				}
			}
		}
	}

	let _line = 1,
		_depth = 0;
	const lastIndex = buffer.tokens_merge.length - 1;
	
	const newIndent = () => Array(_depth * 2).fill('&nbsp;').join('');
	
	const newLineBreak = (byPass=false) => {
		_line++;
		return (_depth > 0 || byPass) ? '<br>' : '';
	}
	
	const newLineBreakAndIndent = (byPass=false) => newLineBreak(byPass) + newIndent();
	
	if (error) {
		let _line_fallback = 1;
		const countCarrigeReturn = (string) => {
			let count = 0;
			for (var i = 0; i < string.length; i++) {
				if (['\n','\r'].indexOf(string[i]) > -1) count++;
			}
			return count;
		}
		
		_line = 1;
		for (var i = 0; i < buffer.tokens_merge.length; i++) {
			const token = buffer.tokens_merge[i],
				  type = token.type,
				  string = token.string;
			if (type === 'linebreak') {
				_line++;
			}
			
			buffer.markup += newSpan(i, token, _depth, colors);
			_line_fallback += countCarrigeReturn(string);
		}
		_line++;
		_line_fallback++;
		if (_line < _line_fallback) {
			_line = _line_fallback;
		}
		
		const isFunction = (functionToCheck) => functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';

		/*
		if ('modifyErrorText' in this.props && isFunction(this.props.modifyErrorText)) {
			error.reason = this.props.modifyErrorText(error.reason);
		}
		*/
	} else {
		// FORMAT BY TOKEN!!
		// TODO: Simplify this....
		for (var i = 0; i < buffer.tokens_merge.length; i++) {
			const token  = buffer.tokens_merge[i];
			switch(token.type) {
				case 'string':
				case 'number':
				case 'primitive':
				case 'error':
					//buffer.markup += followsSymbol(buffer.tokens_merge, i, [',', '[']) ? newLineBreakAndIndent() : '';
					buffer.markup += newSpan(i, token, _depth, colors);
					break;
				case 'key':
					buffer.markup += (newLineBreakAndIndent() + newSpan(i, token, _depth, colors));
					break;
				case 'colon':
					buffer.markup += (newSpan(i, token, _depth, colors) + '&nbsp;');
					break;
				case 'symbol':
					const islastToken = i === lastIndex;
					switch(token.string) {
						case '{':
							buffer.markup += newSpan(i, token, _depth, colors);
							_depth++;
							break;
						case '}':
							_depth = _depth > 0 ? _depth - 1 : _depth;
							const _adjustment = i > 0 ? followsSymbol(buffer.tokens_merge, i, ['[', '{'])  ? '' : newLineBreakAndIndent(islastToken) : '';
							
							buffer.markup += (_adjustment + newSpan(i, token, _depth, colors));
							break;
						case '[':
							if (followsSymbol(buffer.tokens_merge, i, ['['])) {
								_depth++;
								buffer.markup += newLineBreakAndIndent();
							}
							buffer.markup += newSpan(i, token, _depth, colors);
							break;
						case ']':
							let tmp_token = { ...token },
								ind_bool = false;
							
							if (followsSymbol(buffer.tokens_merge, i, [']'])) {
								if (followedBySymbol(buffer.tokens_merge, i, [']'])) {
									if (followedBySymbol(buffer.tokens_merge, i+1, [','])) {
										_depth = _depth >= 1 ? _depth - 1 : _depth;
										ind_bool = true;
										i++;
									} else if (followedBySymbol(buffer.tokens_merge, i+1, [']'])) {
										_depth = _depth >= 1 ? _depth - 1 : _depth;
										ind_bool = true;
									}
								} else if (followedBySymbol(buffer.tokens_merge, i, ['}'])) {
									_depth = _depth >= 1 ? _depth - 1 : _depth;
									ind_bool = true;
								}
							}
							
							buffer.markup += ((ind_bool ? newLineBreakAndIndent() : '') + newSpan(i, tmp_token, _depth, colors));
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
			}
		}
 	}

	for (var i = 0; i < buffer.tokens_merge.length; i++) {
		let token = buffer.tokens_merge[i];
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
		error: error
	};
}


// JS OBJECTS || PLACEHOLDER
// Helper Functions
const stringHasQuotes = (str) => str.match(/^[\'\"].*[\'\"]$/) ? true : false;

const stringMayRemoveQuotes = (nonAlphaNumeric, text) => {
	let numberAndLetter = false;
	
	for (var i = 0; i < text.length; i++) {
		if (i === 0) if (isNaN(text.charAt(i))) break;
		if (isNaN(text.charAt(i))){
			numberAndLetter = true;
			break;
		}
	}
	return !(nonAlphaNumeric.length > 0 || numberAndLetter);
}

const stripQuotesFromKey = (text) => {
	if (text.length === 0) return text;
	if (['""', "''"].indexOf(text) > -1) return "''";
	let wrappedInQuotes = false;

	if (text.match(/^[\"\'].*[\"\']$/)) {
		wrappedInQuotes = true;
	}

	if (wrappedInQuotes && text.length >= 2) text = text.slice(1, -1);
	const nonAlphaNumeric = text.replace(/\w/g,''),
		  alphaNumeric = text.replace(/\W+/g,''),
		  mayRemoveQuotes = stringMayRemoveQuotes(nonAlphaNumeric, text),
		  hasQuotes = stringHasQuotes(nonAlphaNumeric);

	if (hasQuotes){
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

// Cleanup??
const add_tokenSecondary = (buffer) => {
	if (buffer.tokenSecondary.length === 0) return false;
	buffer.tokens.push(buffer.tokenSecondary);
	buffer.tokenSecondary = '';
	return true;
}

// Cleanup??
const add_tokenPrimary = (buffer, value) => {
	if (value.length === 0) return false;
	buffer.tokens.push(value);
	return true;
}

// Cleanup??
const escape_character = (buffer) => {
	if (buffer.currentChar !== '\\') return false;
	buffer.inputText = deleteCharAt(buffer.inputText, buffer.position);
	return true;
}

// Cleanup??
const determine_string = (buffer) => {
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

// Cleanup??
const determine_value = (buffer) => {
	if (':,{}[]'.indexOf(buffer.currentChar) === -1 || buffer.stringOpen) return false;
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
		buffer.isValue = (buffer.brackets[buffer.brackets.length - 1] === '[');
	}
	return true;
}

// Main Function
export const JSON_Placeholder = (obj, colors) => {
    let buffer = {
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
		
		if (!determine_value(buffer) && !determine_string(buffer) && !escape_character(buffer)) {
			if (!buffer.stringOpen) {
				buffer.tokenSecondary += buffer.currentChar;
			}
		}
	})
	
	let buffer2 = {
		brackets: [],
		isValue: false,
		tokens: []
	};

	buffer2.tokens = buffer.tokens.map(token => {
		switch(token){
			case ',':
				buffer2.isValue = (buffer2.brackets[buffer2.brackets.length - 1] === '[');
                return {
                    type: 'symbol',
                    string: token,
                    value: token,
                    depth: buffer2.brackets.length
                }
			case ':':
			    buffer2.isValue = true;
				return {
                    type: 'symbol',
                    string: token,
                    value: token,
                    depth: buffer2.brackets.length
                }
			case '{':
			case '[' :
				buffer2.brackets.push(token);
				buffer2.isValue = (buffer2.brackets[buffer2.brackets.length - 1] === '[');
			    return {
                    type: 'symbol',
                    string: token,
                    value: token,
                    depth: buffer2.brackets.length
                }
			case '}':
			case ']':
				buffer2.brackets.pop();
				buffer2.isValue = (buffer2.brackets[buffer2.brackets.length - 1] === '[');
			    return {
                    type: 'symbol',
                    string: token,
                    value: token,
                    depth: buffer2.brackets.length
                }
			case 'undefined':
			    return {
                    type: 'primitive',
                    string: token,
                    value: undefined,
                    depth: buffer2.brackets.length
                }
			case 'null':
				return {
                    type: 'primitive',
                    string: token,
                    value: null,
                    depth: buffer2.brackets.length
                }
			case 'false':
			    return {
                    type: 'primitive',
                    string: token,
                    value: false,
                    depth: buffer2.brackets.length
                }
			case 'true':
			    return {
                    type: 'primitive',
                    string: token,
                    value: true,
                    depth: buffer2.brackets.length
                }
			default:
				const C = token.charAt(0);
				let rtn = {
                    type: '',
                    string: '',
                    value: '',
                    depth: buffer2.brackets.length
				}
				
				if ('\'"'.indexOf(C) > -1) {
					rtn.type = buffer2.isValue ? 'string' : 'key';
					if (rtn.type === 'key') rtn.string = stripQuotesFromKey(token);
					if (rtn.type === 'string') {
						rtn.string = '';
						const charList2 = token.slice(1, -1).split('');
						for (var ii = 0; ii < charList2.length; ii++) {
							let char = charList2[ii];
							if ('\'\"'.indexOf(char) > -1) char = '\\' + char;
							rtn.string += char;
						}
						rtn.string = "'" + rtn.string + "'";
					}
					rtn.value = rtn.string;
					return rtn
				}
				
				if (!isNaN(token)) {
					rtn.type = 'number';
					rtn.string = token;
					rtn.value = Number(token);
					return rtn
				}
				
				if (rtn.token.length > 0 && !buffer2.isValue) {
					rtn.type = 'key';
					rtn.string = token;
					if (rtn.string.indexOf(' ') > -1) rtn.string = "'" + rtn.string + "'";
					rtn.value = string;
					return rtn
				}

       	}
  	});

	let clean = buffer2.tokens.map(t => t.string).join('');

	let _line = 1,
		_depth = 0,
		indentation = '',
		markup = '';
	const lastIndex = buffer2.tokens.length - 1;
	
	const indent = (byPass=false) => ((_depth > 0 || byPass) ? '\n' : '') + Array(_depth * 2).fill(' ').join('');

	const indentII = (byPass=false) => {
		if (_depth > 0) _line++;
		return ((_depth > 0 || byPass) ? '<br>' : '') + Array(_depth * 2).fill('&nbsp;').join('');
	};
	
	// FORMAT BY TOKEN!!
	buffer2.tokens.forEach((token, i) => {
		switch(token.type) {
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
				const islastToken = i === lastIndex
				switch(token.string) {
					case '{':
						indentation += token.string
						markup += newSpan(i, token, _depth, colors)
						_depth++;
						if (followedBySymbol(buffer2.tokens, i, ['}'])) {
							indentation += indent();
							markup += indentII();
						}
						break;
					case '}':
						_depth = _depth >= 1 ? _depth - 1 : _depth;
						const _adjustment = i > 0 ? followsSymbol(buffer2.tokens, i, ['[', '{']) ? '' : indent(islastToken) : '',
							  _adjustmentII = i > 0 ? followsSymbol(buffer2.tokens, i, ['[', '{']) ? '' : indentII(islastToken) : '';
						
						indentation += (_adjustment + token.string);
						markup += (_adjustmentII + newSpan(i, token, _depth, colors));
						break;
					case '[':
						if (followsSymbol(buffer2.tokens, i, ['['])) {
							_depth++;
							indentation += indent();
							markup += indentII();
						}
						indentation += token.string;
						markup += newSpan(i, token, _depth, colors);
						break;
					case ']':
						let tmp_token = { ...token },
							ind_bool = false;
						
						if (followsSymbol(buffer2.tokens, i, [']'])) {
							if (followedBySymbol(buffer2.tokens, i, [']'])) {
								if (followedBySymbol(buffer2.tokens, i+1, [','])) {
									_depth = _depth >= 1 ? _depth - 1 : _depth;
									ind_bool = true;
									i++;
								} else if (followedBySymbol(buffer2.tokens, i+1, [']'])) {
									_depth = _depth >= 1 ? _depth - 1 : _depth;
									ind_bool = true;
								}
							} else if (followedBySymbol(buffer2.tokens, i, ['}'])) {
								_depth = _depth >= 1 ? _depth - 1 : _depth;
								ind_bool = true;
							}
						}
						
						indentation += ((ind_bool ? indent() : '') + tmp_token.string);
						markup += ((ind_bool ? indentII() : '') + newSpan(i, tmp_token, _depth, colors));
						break;
					case ':':
						indentation += token.string + ' ';
						markup += newSpan(i, token, _depth, colors) + '&nbsp;';
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
      	}
   	})
	_line += 1;

	return {
		tokens: buffer2.tokens,
		noSpaces: clean,
		indented: indentation,
		json: JSON.stringify(obj),
		jsObject: obj,
		markup: markup,
		lines: _line
	};
}