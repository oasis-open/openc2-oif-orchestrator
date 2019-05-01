import React, { Component } from 'react';
import themes from './themes';
import { identical, getType } from './mitsuketa';

import {
    DomNode_Update,
    JSON_Placeholder
} from './tokenize'

import {
    deleteCharAt,
    followedBySymbol,
    followsSymbol,
    typeFollowed
} from './utils'

import err from './err'; // direct copy
import { format } from './locale'; // direct copy
import defaultLocale from './locale/en'; // direct copy

class JSONInput extends Component {
    constructor(props, context) {
        super(props, context);
        this.updateInternalProps = this.updateInternalProps.bind(this);
        this.createMarkup  = this.createMarkup.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.update = this.update.bind(this);
        this.getCursorPosition = this.getCursorPosition.bind(this);
        this.setCursorPosition = this.setCursorPosition.bind(this);
        this.scheduledUpdate = this.scheduledUpdate.bind(this);
        this.setUpdateTime = this.setUpdateTime.bind(this);
        this.renderLabels = this.renderLabels.bind(this);
        //this.newSpan = this.newSpan.bind(this);
        this.renderErrorMessage = this.renderErrorMessage.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.showPlaceholder = this.showPlaceholder.bind(this);
        this.tokenize = this.tokenize.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.stopEvent = this.stopEvent.bind(this);
        this.refContent = null;
        this.refLabels = null;
        this.updateInternalProps();
        this.renderCount = 1;

        this.state  = {
            prevPlaceholder: '',
            markupText: '',
            plainText: '',
            json: '',
            jsObject: undefined,
            lines: false,
            error: false
        }
        if (!this.props.locale) {
            console.warn("[jadn-editor - Deprecation Warning] You did not provide a 'locale' prop for your JSON input - This will be required in a future version. English has been set as a default.");
        }
    }

    componentDidUpdate() {
        this.updateInternalProps();
        this.showPlaceholder();
    }

    componentDidMount() {
        this.showPlaceholder();
    }

    componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    updateInternalProps() {
        let theme = themes.dark_vscode_tribute;

        if ('theme' in this.props && typeof this.props.theme === 'string' && this.props.theme in themes) {
            theme = themes[this.props.theme];
        }

        this.colors = theme;

        if ('colors' in this.props) {
            let checkColor = (c) => c in this.props.colors ? this.props.colors[c] : this.colors[c];
            this.colors = {
                default: checkColor('default'),
                string: checkColor('string'),
                number: checkColor('number'),
                colon: checkColor('colon'),
                keys: checkColor('keys'),
                keys_whiteSpace: checkColor('keys_whiteSpace'),
                primitive: checkColor('primitive'),
                error: checkColor('error'),
                background: checkColor('background'),
                background_warning: checkColor('background_warning')
            }
        }

        if ('style' in this.props) {
            let checkStyle = (s) => s in this.props.style ? this.props.style[s] : {};
            this.style = {
                outerBox: checkStyle('outerBox'),
                warningBox: checkStyle('warningBox'),
                container: checkStyle('container'),
                errorMessage: checkStyle('errorMessage'),
                body: checkStyle('body'),
                labelColumn: checkStyle('labelColumn'),
                labels: checkStyle('labels'),
                contentBox: checkStyle('contentBox')
            }
        } else {
            this.style = {
                outerBox     : {},
                container    : {},
                warningBox   : {},
                errorMessage : {},
                body         : {},
                labelColumn  : {},
                labels       : {},
                contentBox   : {}
            }
        }

        this.confirmGood = 'confirmGood' in this.props ? this.props.confirmGood : true;
        this.totalHeight = (this.props.height || '610px');
        this.totalWidth  = (this.props.width || '479px');

        if ((!('onKeyPressUpdate' in this.props)) || this.props.onKeyPressUpdate) {
            if (!this.timer) {
                this.timer = setInterval(this.scheduledUpdate, 100)
            }
        } else if (this.timer) {
            clearInterval(this.timer);
            this.timer = false;
        }
        this.updateTime = false;
        this.waitAfterKeyPress = 'waitAfterKeyPress' in this.props? this.props.waitAfterKeyPress : 1000;
        this.resetConfiguration = 'reset' in this.props ? this.props.reset : false;
    }

    onClick() {
        if ('viewOnly' in this.props && this.props.viewOnly) {
            return;
        }
    }

    onBlur() {
        if ('viewOnly' in this.props && this.props.viewOnly) {
            return;
        }
        this.update(0, false);
    }

    update(cursorOffset=0,updateCursorPosition=true){
        const container = this.refContent,
            data = this.tokenize(container),
            updateData = {
                plainText: data.indented,
                markupText: data.markup,
                json: data.json,
                jsObject: data.jsObject,
                lines: data.lines,
                error: data.error
            };

        if ('onChange' in this.props) {
            this.props.onChange(updateData);
        }

        let cursorPosition = this.getCursorPosition(data.error) + cursorOffset;
        this.setState(updateData);

        this.updateTime = false;
        if (updateCursorPosition) {
            this.setCursorPosition(cursorPosition);
        }
    }

    getCursorPosition(countBR) {
        const isChildOf = node => {
            while (node !== null) {
                if (node === this.refContent) return true;
                node = node.parentNode;
            }
            return false;
        };

        let selection = window.getSelection(),
            charCount = -1,
            linebreakCount = 0,
            node;

        if (selection.focusNode && isChildOf(selection.focusNode)) {
            node = selection.focusNode;
            charCount = selection.focusOffset;
            while (node) {
                if (node === this.refContent) {
                    break;
                }
                if (node.previousSibling) {
                    node = node.previousSibling;
                    if (countBR && node.nodeName==='BR') {
                        linebreakCount++;
                    }
                    charCount += node.textContent.length;
                } else {
                    node = node.parentNode;
                    if (node === null) {
                        break;
                    }
                }
            }
        }
        return charCount + linebreakCount;
    }

    setCursorPosition(nextPosition) {
        if ([false, null, undefined].indexOf(nextPosition) > -1) {
            return;
        }
        const createRange = (node, chars, range) => {
            if (!range) {
                range = document.createRange();
                range.selectNode(node);
                range.setStart(node, 0);
            }

            if (chars.count === 0) {
                range.setEnd(node, chars.count);
            } else if (node && chars.count >0) {
                if (node.nodeType === Node.TEXT_NODE) {
                    if (node.textContent.length < chars.count) {
                        chars.count -= node.textContent.length;
                    } else {
                        range.setEnd(node, chars.count);
                        chars.count = 0;
                    }
                } else {
                    for (var lp = 0; lp < node.childNodes.length; lp++) {
                        range = createRange(node.childNodes[lp], chars, range);
                        if (chars.count === 0) {
                            break;
                        }
                    }
                }
            }
            return range;
        };

        const setPosition = chars => {
            if (chars < 0) {
                return;
            }
            let selection = window.getSelection(),
                range = createRange(this.refContent, { count: chars });
            if (!range) {
                return;
            }
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        };

        if (nextPosition > 0) {
            setPosition(nextPosition);
        } else {
            this.refContent.focus();
        }
    }

    scheduledUpdate() {
        if ('onKeyPressUpdate' in this.props && this.props.onKeyPressUpdate === false) {
            return;
        }

        const { updateTime } = this;
        if (updateTime === false || updateTime > new Date().getTime()) {
            return;
        }
        this.update();
    }

    setUpdateTime() {
        if ('onKeyPressUpdate' in this.props && this.props.onKeyPressUpdate===false) {
            return;
        }
        this.updateTime = new Date().getTime() + this.waitAfterKeyPress;
    }

    onScroll(event) {
        this.refLabels.scrollTop = event.target.scrollTop;
    }

    onKeyPress(event) {
        const ctrlOrMetaIsPressed = event.ctrlKey || event.metaKey;
        if (this.props.viewOnly && !ctrlOrMetaIsPressed) {
            this.stopEvent(event);
        }
        if (!ctrlOrMetaIsPressed) {
            this.setUpdateTime();
        }
    }

    onKeyDown(event) {
        const viewOnly = !!this.props.viewOnly;
        const ctrlOrMetaIsPressed = event.ctrlKey || event.metaKey;

        switch(event.key){
            case 'Tab':
                this.stopEvent(event);
                if (viewOnly) {
                    break;
                }
                document.execCommand("insertText", false, "  ");
                this.setUpdateTime();
                break;
            case 'Backspace':
            case 'Delete':
                if (viewOnly) {
                    this.stopEvent(event);
                }
                this.setUpdateTime();
                break;
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'ArrowUp':
            case 'ArrowDown':
                this.setUpdateTime();
                break;
            case 'a':
            case 'c':
                if (viewOnly && !ctrlOrMetaIsPressed) {
                    this.stopEvent(event);
                }
                break;
            default :
                if (viewOnly) {
                    this.stopEvent(event);
                }
                break;
        }
    }

    onPaste(event) {
        if (this.props.viewOnly) {
            this.stopEvent(event);
        } else {
            event.preventDefault();
            var text = event.clipboardData.getData('text/plain');
            document.execCommand('insertHTML', false, text);
        }
        this.update();
    }

    stopEvent(event) {
        if (!event) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
    }

    createMarkup(markupText) {
        return { __html: markupText === undefined ? '' : '' + markupText};
    }

    showPlaceholder() {
        if (!'placeholder' in this.props) {
            return;
        }
        const { placeholder } = this.props;

        if ([undefined, null].indexOf(placeholder) > -1) {
            return;
        }
        const { prevPlaceholder, jsObject } = this.state;
        const { resetConfiguration } = this;
        const placeholderDataType = getType(placeholder);

        if (['object', 'array'].indexOf(placeholderDataType) === -1) {
            err.throwError('showPlaceholder','placeholder','either an object or an array');
        }

        const samePlaceholderValues = identical(placeholder,prevPlaceholder);
        let componentShouldUpdate = !samePlaceholderValues;

        if (!componentShouldUpdate && resetConfiguration & jsObject !== undefined) {
            componentShouldUpdate = !identical(placeholder, jsObject);
        }

        if (!componentShouldUpdate) {
            return;
        }

        const data = this.tokenize(placeholder);
        this.setState({
            prevPlaceholder: placeholder,
            plainText: data.indentation,
            markupText: data.markup,
            lines: data.lines,
            error: data.error
        });
    }

    tokenize(obj) {
        let objType = getType(obj);

        if (objType !== 'object') {
            return console.error('tokenize() expects object type properties only. Got \'' + objType + '\' type instead.');
        }

        const locale = this.props.locale || defaultLocale;

        // DOM Node || OnBlue or Update
        if ('nodeType' in obj) {
            return DomNode_Update(obj, locale, this.colors)
        }

        // JS OBJECTS || PLACEHOLDER
        if (!('nodeType' in obj)) {
            return JSON_Placeholder(obj, this.colors)
        }

        console.log('Oops....')
    }

    renderErrorMessage() {
        const error = this.state.error,
            locale = this.props.locale || defaultLocale,
            style = this.style;

        if (!error) return void(0);

        return (
            <p
                style={{
                    color: 'red',
                    fontSize: '12px',
                    position: 'absolute',
                    width: 'calc(100% - 60px)',
                    height: '60px',
                    boxSizing: 'border-box',
                    margin: 0,
                    padding: 0,
                    paddingRight: '10px',
                    overflowWrap: 'break-word',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    ...style.errorMessage
                }}
            >
             { format(locale.format, error) }
            </p>
        );
    }

    renderLabels() {
        const colors = this.colors,
            style = this.style,
            errorLine = this.state.error ? this.state.error.line : -1,
            lines = this.state.lines ? this.state.lines : 1;

        let labels = new Array(lines);

        for (var i = 0; i < lines - 1; i++) labels[i] = i + 1;

        return labels.map( number => {
            const color = number !== errorLine ? colors.default : 'red';
            return (
                <div 
                    key={ number }
                    style={{
                        ...style.labels,
                        color : color
                    }}
                >
                    { number }
                </div>
            );
        });
    }

    render() {
        const id = this.props.id,
            markupText = this.state.markupText,
            error = this.state.error,
            colors = this.colors,
            style = this.style,
            confirmGood = this.confirmGood,
            totalHeight = this.totalHeight,
            totalWidth = this.totalWidth,
            hasError = error ? 'token' in error : false;
        this.renderCount++;

        return (
            <div
                name='outer-box'
                id={ id && id + '-outer-box' }
                style={{
                    display: 'block',
                    overflow: 'none',
                    height: totalHeight,
                    width: totalWidth,
                    margin: 0,
                    boxSizing: 'border-box',
                    position: 'relative',
                    ...style.outerBox
                }}
            >
                { confirmGood ?
                    <div
                        style={{
                            opacity: hasError ? 0 : 1,
                            height                   : '30px',
                            width                    : '30px',
                            position                 : 'absolute',
                            top                      : 0,
                            right                    : 0,
                            transform                : 'translate(-25%,25%)',
                            pointerEvents            : 'none',
                            transitionDuration       : '0.2s',
                            transitionTimingFunction : 'cubic-bezier(0, 1, 0.5, 1)'
                        }}
                    >
                        <svg height='30px' width='30px' viewBox='0 0 100 100' >
                            <path fillRule='evenodd' clipRule='evenodd' fill='green' opacity='0.85' d='M39.363,79L16,55.49l11.347-11.419L39.694,56.49L72.983,23L84,34.085L39.363,79z' />
                        </svg>
                    </div>
                : '' }
                <div
                    name='container'
                    id={ id && id + '-container' }
                    style={{
                        display: 'block',
                        height: totalHeight,
                        width: totalWidth,
                        margin: 0,
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        fontFamily: 'Roboto, sans-serif',
                        ...style.container
                    }}
                    onClick={ this.onClick }
                >
                    <div
                        name='warning-box'
                        id={ id && id + '-warning-box' }
                        style={{
                            display: 'block',
                            overflow: 'hidden',
                            height: hasError ? '60px' : '0px',
                            width: '100%',
                            margin: 0,
                            backgroundColor: colors.background_warning,
                            transitionDuration: '0.2s',
                            transitionTimingFunction: 'cubic-bezier(0, 1, 0.5, 1)',
                            ...style.warningBox
                        }}
                        onClick={ this.onClick }
                    >
                        <span
                            style={{
                                display: 'inline-block',
                                height: '60px',
                                width: '60px',
                                margin: 0,
                                boxSizing: 'border-box',
                                overflow: 'hidden',
                                verticalAlign: 'top',
                                pointerEvents: 'none'
                            }}
                            onClick={ this.onClick }
                        >
                            <div
                                style={{
                                    position: 'relative',
                                    top: 0,
                                    left: 0,
                                    height: '60px',
                                    width: '60px',
                                    margin: 0,
                                    pointerEvents: 'none'
                                }}
                                onClick={ this.onClick }
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        pointerEvents: 'none'
                                    }}
                                    onClick={ this.onClick }
                                >
                                    <svg height='25px' width='25px' viewBox='0 0 100 100' >
                                        <path
                                            fillRule='evenodd'
                                            clipRule='evenodd'
                                            fill='red'
                                            d='M73.9,5.75c0.467-0.467,1.067-0.7,1.8-0.7c0.7,0,1.283,0.233,1.75,0.7l16.8,16.8  c0.467,0.5,0.7,1.084,0.7,1.75c0,0.733-0.233,1.334-0.7,1.801L70.35,50l23.9,23.95c0.5,0.467,0.75,1.066,0.75,1.8  c0,0.667-0.25,1.25-0.75,1.75l-16.8,16.75c-0.534,0.467-1.117,0.7-1.75,0.7s-1.233-0.233-1.8-0.7L50,70.351L26.1,94.25  c-0.567,0.467-1.167,0.7-1.8,0.7c-0.667,0-1.283-0.233-1.85-0.7L5.75,77.5C5.25,77,5,76.417,5,75.75c0-0.733,0.25-1.333,0.75-1.8  L29.65,50L5.75,26.101C5.25,25.667,5,25.066,5,24.3c0-0.666,0.25-1.25,0.75-1.75l16.8-16.8c0.467-0.467,1.05-0.7,1.75-0.7  c0.733,0,1.333,0.233,1.8,0.7L50,29.65L73.9,5.75z'
                                        />
                                    </svg>
                                </div>
                            </div>
                        </span>
                        <span
                            style={{
                                display: 'inline-block',
                                height: '60px',
                                width: 'calc(100% - 60px)',
                                margin: 0,
                                overflow: 'hidden',
                                verticalAlign: 'top',
                                position: 'absolute',
                                pointerEvents: 'none'
                            }}
                            onClick={ this.onClick }
                        >
                            { this.renderErrorMessage() }
                        </span>
                    </div>
                    <div
                        name='body'
                        id={ id && id + '-body' }
                        style={{
                            display: 'flex',
                            overflow: 'none',
                            height: hasError ? 'calc(100% - 60px)' : '100%',
                            width: '',
                            margin: 0,
                            resize: 'none',
                            fontFamily: 'Roboto Mono, Monaco, monospace',
                            fontSize: '11px',
                            backgroundColor: colors.background,
                            transitionDuration: '0.2s',
                            transitionTimingFunction: 'cubic-bezier(0, 1, 0.5, 1)',
                            ...style.body
                        }}
                        onClick={ this.onClick }
                    >
                        <span
                            name='labels'
                            id={ id && id + '-labels' }
                            ref={ ref => this.refLabels = ref }
                            style={{
                                display: 'inline-block',
                                boxSizing: 'border-box',
                                verticalAlign: 'top',
                                height: '100%',
                                width: '44px',
                                margin: 0,
                                padding: '5px 0px 5px 10px',
                                overflow: 'hidden',
                                color: '#D4D4D4',
                                ...style.labelColumn
                            }}
                            onClick={ this.onClick }
                        >
                            { this.renderLabels() }
                        </span>
                        <span
                            id={ id }
                            ref={ ref => this.refContent = ref }
                            contentEditable={ true }
                            style={{
                                display: 'inline-block',
                                boxSizing: 'border-box',
                                verticalAlign: 'top',
                                height: '100%',
                                width: '',
                                flex: 1,
                                margin: 0,
                                padding: '5px',
                                overflowX: 'hidden',
                                overflowY: 'auto',
                                wordWrap: 'break-word',
                                whiteSpace: 'pre-line',
                                color: '#D4D4D4',
                                outline: 'none',
                                ...style.contentBox
                            }}
                            dangerouslySetInnerHTML = { this.createMarkup(markupText) }
                            onKeyPress = { this.onKeyPress }
                            onKeyDown = { this.onKeyDown }
                            onClick = { this.onClick }
                            onBlur = { this.onBlur }
                            onScroll = { this.onScroll }
                            onPaste = { this.onPaste }
                            autoComplete = 'off'
                            autoCorrect = 'off'
                            autoCapitalize = 'off'
                            spellCheck = { false }
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default JSONInput;