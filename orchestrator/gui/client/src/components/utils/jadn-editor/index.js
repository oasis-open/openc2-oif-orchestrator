import React, { Component } from 'react'
import themes from 'react-json-editor-ajrm/themes'

import JSONInput from 'react-json-editor-ajrm'
import { identical, getType } from 'react-json-editor-ajrm/mitsuketa'

import err from 'react-json-editor-ajrm/err'
import { format } from 'react-json-editor-ajrm/locale'
import defaultLocale from 'react-json-editor-ajrm/locale/en'

import {
    // DomNode_Update
    quarkize,
    validToken,
    tokenFollowed,
    followedBySymbol,
    followsSymbol,
    typeFollowed,
    // JSON_Placeholder
    escape_character,
    determine_string,
    determine_value,
    stripQuotesFromKey,
    indent
} from './utils'

import {
    updateArray
} from '../'

class JADNInput extends JSONInput {
    DomNode_Update(obj) {
        const locale = this.props.locale || defaultLocale,
            containerNode = obj.cloneNode(true),
            hasChildren = containerNode.hasChildNodes(),
            children = containerNode.childNodes

        if (!hasChildren) {
            return '';
        }

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
                case 'FONT' :
                    buffer.tokens_unknown.push({
                        string: child.textContent,
                        type: 'unknown'
                    });
                    break;
                default :
                    console.error('Unrecognized node:', {child})
                    break;
            }
        })

        buffer.tokens_proto = buffer.tokens_unknown.map(token => quarkize(token.string, 'proto')).reduce((all, quarks) => all.concat(quarks))

        buffer.tokens_proto.forEach(token => {
            if (token.type.indexOf('proto') === -1 && !validToken(token.string, token.type)) {
                buffer.tokens_split = buffer.tokens_split.concat(quarkize(token.string,'split'));
                return;
            }
            buffer.tokens_split.push(token);
        })

        buffer.tokens_fallback = buffer.tokens_split.map(token => {
            let type = token.type,
                fallback = [];

            if (type.indexOf('-') > -1) {
                type = type.slice(type.indexOf('-') + 1);
                if (type!=='string') {
                    fallback.push('string');
                }
                fallback.push('key', 'error');
            }

            return {
                string: token.string,
                length: token.string.length,
                type: type,
                fallback: fallback
            };
        })

        let buffer2 = {
            brackets: [],
            stringOpen: false,
            isValue: false
        };

        buffer.tokens_normalize = buffer.tokens_fallback.map((token, i) => {
            let normalToken = {
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
                            if (tokenFollowed(buffer).type === 'colon') {
                                break;
                            }
                            buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1] === '[';
                            break;
                        case ':':
                            normalToken.type = 'colon';
                            buffer2.isValue = true;
                            break;
                    }
                    break;
                case 'delimiter':
                    normalToken.type = buffer2.isValue ? 'string' : 'key';
                    if (!buffer2.stringOpen) {
                        buffer2.stringOpen = normalToken.string;
                        break;
                    }
                    if (i > 0) {
                        const previousToken = buffer.tokens_fallback[i - 1],
                            _string = previousToken.string,
                            _type = previousToken.type,
                            _char = _string.charAt(_string.length - 1);
                        if (_type === 'string' && _char === '\\') {
                            break;
                        }
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
                    if (normalToken.string === '\n' && !buffer2.stringOpen) {
                        normalToken.type = 'linebreak';
                        break;
                    }

                    normalToken.type = buffer2.isValue ? 'string' : 'key';
                    break;
                case 'space':
                case 'number':
                    if (buffer2.stringOpen) {
                        normalToken.type = buffer2.isValue ? 'string' : 'key';
                    }
                    break;
                default:
                    break;
            }
            return normalToken;
        })

        for (var i = 0; i < buffer.tokens_normalize.length; i++) {
            const token = buffer.tokens_normalize[i];

            let mergedToken = {
                string: token.string,
                type: token.type,
                tokens: [i]
            };

            if (['symbol', 'colon'].indexOf(token.type) === -1 && i+1 < buffer.tokens_normalize.length) {
                let count = 0;

                for (var u = i+1; u < buffer.tokens_normalize.length; u++) {
                    const nextToken = buffer.tokens_normalize[u];
                    if (token.type !== nextToken.type) {
                        break;
                    }
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
            line = buffer.tokens_merge.length > 0 ? 1 : 0;

        buffer2 = {
            brackets: [],
            stringOpen: false,
            isValue: false
        };

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

            switch (type) {
                case 'space':
                    break;
                case 'linebreak':
                    line++;
                    break;
                case 'symbol':
                    switch (string) {
                        case '{':
                        case '[':
                            found = followsSymbol(buffer, i, ['}', ']']);
                            if (found) {
                                setError(i, format(locale.invalidToken.tokenSequence.prohibited, {
                                    firstToken: buffer.tokens_merge[found].string,
                                    secondToken: string
                                }));
                                break;
                            }
                            if (string === '[' && i > 0 && !followsSymbol(buffer, i,[':','[',','])) {
                                setError(i,format(locale.invalidToken.tokenSequence.permitted, {
                                    firstToken: "[",
                                    secondToken: [":", "[", ","]
                                }));
                                break;
                            }
                            if (string === '{' && followsSymbol(buffer, i, ['{'])) {
                                setError(i, format(locale.invalidToken.double, {
                                    token: "{"
                                }));
                                break;
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
                                }
                            }

                            if (string === '}') {
                                if (followsSymbol(buffer, i, [','])) {
                                    setError(i, format(locale.invalidToken.tokenSequence.prohibited, {
                                        firstToken: ",",
                                        secondToken: "}"
                                    }));
                                    break;
                                }
                            }

                            if (string === ']') {
                                if (buffer2.brackets[buffer2.brackets.length-1] !== '[') {
                                    setError(i, format(locale.brace.square.missingOpen));
                                    break;
                                }
                            }

                            if (string === ']') {
                                if (followsSymbol(buffer, i, [':'])) {
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
                            found = followsSymbol(buffer, i, ['{']);
                            if (found) {
                                if (followedBySymbol(buffer, i, ['}'])) {
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
                            }

                            if (followedBySymbol(buffer, i, ['}', ',', ']'])) {
                                setError(i, format(locale.noTrailingOrLeadingComma));
                                break;
                            }

                            found = typeFollowed(buffer, i);
                            switch (found) {
                                case 'key':
                                case 'colon':
                                    setError(i, format(locale.invalidToken.termSequence.prohibited, {
                                        firstTerm: found==='key' ? locale.types.key : locale.symbols.colon,
                                        secondTerm: locale.symbols.comma
                                    }));
                                    break;
                                case 'symbol' :
                                    if (followsSymbol(buffer, i, ['{'])) {
                                        setError(i, format(locale.invalidToken.tokenSequence.prohibited, {
                                            firstToken: "{",
                                            secondToken: ","
                                        }));
                                        break;
                                    }
                                    break;
                            }
                            buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1] === '[';
                            break;
                    }
                    buffer.json += string;
                    break;
                case 'colon':
                    found = followsSymbol(buffer, i, ['[']);
                    if (found) {
                        if (followedBySymbol(buffer, i, [']'])) {
                            setError(i, format(locale.brace.square.cannotWrap, {
                                token: ":"
                            }));
                            break;
                        }
                        setError(i, format(locale.invalidToken.tokenSequence.prohibited, {
                            firstToken: "[",
                            secondToken: ":"
                        }));
                        break;
                    }
                    if (typeFollowed(buffer, i) !== 'key') {
                        setError(i, format(locale.invalidToken.termSequence.permitted, {
                            firstTerm: locale.symbols.colon,
                            secondTerm: locale.types.key
                        }));
                        break;
                    }

                    if (followedBySymbol(buffer, i, ['}', ']'])) {
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
                        setError(i,format(locale.string.missingOpen, {
                            quote: firstChar
                        }));
                        break;
                    }

                    if (quotes.indexOf(lastChar) === -1 && quotes.indexOf(firstChar) !== -1) {
                        setError(i, format(locale.string.missingClose, {
                            quote: firstChar,
                        }));
                        break;
                    }

                    if (quotes.indexOf(firstChar) > -1 && firstChar !== lastChar) {
                        setError(i, format(locale.string.missingClose, {
                            quote: firstChar,
                        }));
                        break;
                    }

                    if ('string' === type && quotes.indexOf(firstChar) === -1 && quotes.indexOf(lastChar) === -1) {
                        setError(i, format(locale.string.mustBeWrappedByQuotes));
                        break;
                    }

                    if ('key' === type && followedBySymbol(buffer, i, ['}', ']'])) {
                        setError(i, format(locale.invalidToken.termSequence.permitted, {
                            firstTerm: locale.types.key,
                            secondTerm: locale.symbols.colon
                        }));
                    }

                    if (quotes.indexOf(firstChar) === -1 && quotes.indexOf(lastChar) === -1) {
                        for (var h = 0; h < string.length; h++) {
                            if (error) { break }
                            const c = string.charAt(h);
                            if (alphanumeric.indexOf(c) === -1) {
                                setError(i, format(locale.string.nonAlphanumeric, {
                                    token: c,
                                }));
                                break;
                            }
                        }
                    }

                    string = firstChar === "'" ? '"' + string.slice(1,-1) + '"' : (firstChar !== '"' ? '"' + string + '"' : string);

                    if ('key' === type) {
                        if ('key' === typeFollowed(buffer, i)) {
                            if (i > 0 && !isNaN(buffer.tokens_merge[i-1])) {
                                buffer.tokens_merge[i-1] += buffer.tokens_merge[i];
                                setError(i, format(locale.key.numberAndLetterMissingQuotes));
                                break;
                            }
                            setError(i, format(locale.key.spaceMissingQuotes));
                            break;
                        }
                        if (!followsSymbol(buffer, i, ['{', ','])) {
                            setError(i, format(locale.invalidToken.tokenSequence.permitted, {
                                firstToken: type,
                                secondToken: ["{", ","]
                            }));
                            break;
                        }
                        if (buffer2.isValue) {
                            setError(i, format(locale.string.unexpectedKey));
                            break;
                        }
                    }

                    if ('string' === type) {
                        if (!followsSymbol(buffer, i, ['[', ':', ','])) {
                            setError(i, format(locale.invalidToken.tokenSequence.permitted, {
                                firstToken: type,
                                secondToken: ["[", ":", ","]
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
                    if (followsSymbol(buffer, i, ['{'])) {
                        buffer.tokens_merge[i].type = 'key';
                        type = buffer.tokens_merge[i].type;
                        string = '"' + string + '"';

                    } else if (typeFollowed(buffer, i) === 'key') {
                        buffer.tokens_merge[i].type = 'key';
                        type = buffer.tokens_merge[i].type;

                    } else if (!followsSymbol(buffer, i, ['[', ':', ','])) {
                        setError(i, format(locale.invalidToken.tokenSequence.permitted, {
                            firstToken: type,
                            secondToken: ["[", ":", ","]
                        }));
                        break;
                    }

                    if (type !== 'key' && !buffer2.isValue) {
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
                next = '';
            if (i+1 < buffer.json.length) {
                next = buffer.json.charAt(i+1);
                if (current === '\\' && next === "'") {
                    noEscapedSingleQuote += next;
                    i++;
                    continue;
                }
            }
            noEscapedSingleQuote += current;
        }
        buffer.json = noEscapedSingleQuote;

        let _line = 1,
            _depth = 0;

        const newIndent = () => Array(_depth * 2).fill('&nbsp;').join(''),
            newLineBreak = (byPass=false) => {
                _line++;
                return (_depth > 0 || byPass) ? '<br>' : '';
            },
            newLineBreakAndIndent = (byPass=false) => newLineBreak(byPass) + newIndent();

        if (error) {
            let _line_fallback = 1;
            const countCarrigeReturn = (str) => (str.match(/[\n\r]/g) || []).length;

            _line = 1;
            for (var i = 0; i < buffer.tokens_merge.length; i++) {
                const token = buffer.tokens_merge[i],
                    type = token.type,
                    string = token.string;

                if (type === 'linebreak') { _line++ }
                buffer.markup += this.newSpan(i,token,_depth);
                _line_fallback += countCarrigeReturn(string);
            }
            _line++;
            _line_fallback++;
            if (_line < _line_fallback) {
                _line = _line_fallback;
            }
        } else {
            const maxIterations = Math.ceil(bracketList.length / 2);
            let round = 0,
                delta = false;

            const removePair = (index) => {
                bracketList.splice(index + 1,1);
                bracketList.splice(index,1);
                if (!delta) { delta = true }
            }

            while (bracketList.length > 0) {
                delta = false;
                for (var tokenCount = 0; tokenCount < bracketList.length - 1; tokenCount++) {
                    const pair = bracketList[tokenCount].string + bracketList[tokenCount+1].string;
                    if (['[]', '{}'].indexOf(pair) > -1) {
                        removePair(tokenCount);
                    }
                }
                round++;
                if (!delta) { break }
                if (round >= maxIterations) { break }
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
                } catch (err) {
                    const errorMessage = err.message,
                        subsMark = errorMessage.indexOf('position');

                    if (subsMark === -1) {
                        throw new Error('Error parsing failed');
                    }

                    const errPositionStr = errorMessage.substring(subsMark + 9,errorMessage.length),
                        errPosition = parseInt(errPositionStr);
                    let charTotal = 0,
                        tokenIndex = 0,
                        token = false,
                        exitWhile = false;

                    while (charTotal < errPosition && !exitWhile) {
                        token = buffer.tokens_merge[tokenIndex];
                        if ('linebreak' === token.type) { _line++ }
                        if (['space', 'linebreak'].indexOf(token.type) === -1) {
                            charTotal += token.string.length;
                        }
                        if (charTotal >= errPosition) { break }
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
                            if ((backslashCount % 2 !== 0 || backslashCount === 0) && '\'"bfnrt'.indexOf(char) === -1) {
                                setError(tokenIndex,format(locale.invalidToken.unexpected, {
                                    token: '\\'
                                }));
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

            for (var i = 0; i < buffer.tokens_merge.length; i++) {
                const token = buffer.tokens_merge[i],
                    string = token.string,
                    type = token.type;

                switch (type) {
                    case 'space':
                    case 'linebreak':
                        break;
                    case 'string':
                    case 'number':
                    case 'primitive':
                    case 'error':
                       buffer.markup += ((followsSymbol(buffer, i,[',','[']) ? newLineBreakAndIndent() : '') + this.newSpan(i,token,_depth));
                       break;
                    case 'key':
                        buffer.markup += (newLineBreakAndIndent() + this.newSpan(i,token,_depth));
                        break;
                    case 'colon':
                        buffer.markup += (this.newSpan(i,token,_depth) + '&nbsp;');
                        break;
                    case 'symbol':
                        switch (string) {
                            case '[':
                            case '{':
                                buffer.markup += ((!followsSymbol(buffer, i,[':']) ? newLineBreakAndIndent() : '') + this.newSpan(i,token,_depth)); _depth++;
                                break;
                            case ']':
                            case '}':
                                _depth--;
                                const islastToken  = i === buffer.tokens_merge.length - 1,
                                    _adjustment = i > 0 ? (['[','{'].indexOf(buffer.tokens_merge[i-1].string) > -1 ? '' : newLineBreakAndIndent(islastToken)) : '';
                                buffer.markup += _adjustment + this.newSpan(i,token,_depth);
                                break;
                            case ',':
                                buffer.markup += this.newSpan(i,token,_depth);
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

        if (error) {
            const isFunction = (functionToCheck) => functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
            if ('modifyErrorText' in this.props && isFunction(this.props.modifyErrorText)) {
                error.reason = this.props.modifyErrorText(error.reason);
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

    JSON_Placeholder(obj) {
        const locale = this.props.locale || defaultLocale;
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
            let rtn = {
                type: '',
                string: '',
                value: '',
                depth: 0
            }

            switch(token){
                case ',':
                    updateArray(rtn, {
                        type: 'symbol',
                        string: token,
                        value: token
                    })
                    buffer2.isValue = (buffer2.brackets[buffer2.brackets.length-1] === '[');
                    break;
                case ':':
                    updateArray(rtn, {
                        type: 'symbol',
                        string: token,
                        value: token
                    })
                    buffer2.isValue = true;
                    break;
                case '{':
                case '[':
                    updateArray(rtn, {
                        type: 'symbol',
                        string: token,
                        value: token
                    })
                    buffer2.brackets.push(token);
                    buffer2.isValue = (buffer2.brackets[buffer2.brackets.length-1] === '[');
                    break;
                case '}':
                case ']':
                    updateArray(rtn, {
                        type: 'symbol',
                        string: token,
                        value: token
                    })
                    buffer2.brackets.pop();
                    buffer2.isValue = (buffer2.brackets[buffer2.brackets.length-1] === '[');
                    break;
                case 'undefined':
                    updateArray(rtn, {
                        type: 'primitive',
                        string: token,
                        value: undefined
                    })
                    break;
                case 'null':
                    updateArray(rtn, {
                        type: 'primitive',
                        string: token,
                        value: null
                    })
                    break;
                case 'false':
                    updateArray(rtn, {
                        type: 'primitive',
                        string: token,
                        value: false
                    })
                    break;
                case 'true':
                    updateArray(rtn, {
                        type: 'primitive',
                        string: token,
                        value: true
                    })
                    break;
                default:
                    if ('\'"'.indexOf(token.charAt(0)) > -1) {
                        rtn.type = buffer2.isValue ? 'string' : 'key';
                        rtn.string = rtn.type === 'key' ? stripQuotesFromKey(token) : rtn.string;

                        if (rtn.type === 'string') {
                            const chars = token.slice(1, -1).split('');
                            rtn.string =  "'" + chars.map((c, ii) => ('\'\"'.indexOf(c) > -1 ? '\\' : '') + c).join('') + "'";
                        }
                        rtn.value = rtn.string;
                        break;
                    }

                    if (!isNaN(token)) {
                        updateArray(rtn, {
                            type: 'number',
                            string: token,
                            value: Number(token)
                        })
                        break;
                    }

                    if (token.length > 0 && !buffer2.isValue) {
                        updateArray(rtn, {
                            type: 'key',
                            string: token,
                            value: token.indexOf(' ') > -1 ? "'" + token + "'" : token
                        })
                        break;
                    }
                }
                rtn.depth = buffer2.brackets.length
                return rtn
            });

        const clean = buffer2.tokens.map(t => t.string).join('')

        const indentation = buffer2.tokens.map((token, i) => {
            switch (token.string) {
                case '[':
                case '{':
                    const nextToken = i < (buffer2.tokens.length - 1) - 1 ? buffer2.tokens[i+1] : '';
                    return token.string + ('}]'.indexOf(nextToken.string) === -1 ? indent(token.depth) : '')
                case ']':
                case '}':
                    const prevToken = i > 0 ? buffer2.tokens[i-1] : '';
                    return ('[{'.indexOf(prevToken.string) === -1 ? indent(token.depth) : '') + token.string;
                case ':':
                    return token.string + ' ';
                case ',':
                    return token.string + indent(token.depth);
                default:
                    return token.string;
            }
        }).join('')

        let lines = 1;
        const indentII = (number) => {
            if (number > 0 ) lines++;
            return (number > 0 ? '<br>' : '') + Array(number * 2).fill('&nbsp;').join('');
        }

        const lastIndex = buffer2.tokens.length - 1;
        const markup = buffer2.tokens.map((token, i) => {
            let span = this.newSpan(i, token, token.depth);

            switch (token.string) {
                case '{':
                case '[':
                    const nextToken = i < (buffer2.tokens.length - 1) - 1 ? buffer2.tokens[i+1] : '';
                    return span + ('}]'.indexOf(nextToken.string) === -1 ? indentII(token.depth) : '');
                case '}':
                case ']' :
                    const prevToken = i > 0 ? buffer2.tokens[i-1] : '';
                    return ('[{'.indexOf(prevToken.string) === -1 ? indentII(token.depth) + (lastIndex === i ? '<br>' : '') : '') + span;
                case ':':
                    return span + ' ';
                case ',':
                    return span + indentII(token.depth);
                default:
                    return span;
            }
        }).join('')

        return {
            tokens: buffer2.tokens,
            noSpaces: clean,
            indented: indentation,
            json: JSON.stringify(obj),
            jsObject: obj,
            markup: markup,
            lines: lines + 2
        };
    }

    tokenize (obj) {
        let objType = getType(obj)

        if (objType !== 'object') {
            return console.error('tokenize() expects object type properties only. Got \'' + objType + '\' type instead.');
        }

        // DOM NODE || ONBLUR OR UPDATE
        if('nodeType' in obj){
            return this.DomNode_Update(obj)
        }

        // JS OBJECTS || PLACEHOLDER
        if (!('nodeType' in obj)) {
            return this.JSON_Placeholder(obj)
        }
    }
}

export default JADNInput;