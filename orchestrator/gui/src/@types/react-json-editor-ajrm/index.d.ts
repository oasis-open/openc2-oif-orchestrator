declare module 'react-json-editor-ajrm' {
    import { Component, CSSProperties, SyntheticEvent } from 'react';
    import { Locale } from 'react-json-editor-ajrm/locale';
    import { ThemeColors } from 'react-json-editor-ajrm/themes';

    // Basic Types
    type ObjectJSON = Record<string, any>
    type ObjectPlaceholder = Record<string, any>

    // Token Interfaces
    interface SimpleToken {
        string: string;
        type: 'colon'|'delimiter'|'error'|'linebreak'|'key'|'null'|'number'|'primitive'|'space'|'string'|'symbol'|'undefined'|'unknown';
    }

    interface MarkupToken extends SimpleToken {
        value: boolean|number|null|string|undefined;
        depth: number;
    }

    interface MergeToken extends SimpleToken {
        tokens: Array<number>;
    }

    interface ErrorMsg {
        token: number;
        line: number;
        reason: string;
    }

    // Tokenize Interfaces
    interface Tokenize {
        noSpaces: string,
        indented: string,
        json: string,
        jsObject: ObjectJSON,
        markup: string
        lines: number,
        error?: ErrorMsg
    }

    interface DomNodeTokenize extends Tokenize {
        tokens: Array<MergeToken>;
    }

    interface PlaceholderTokenize extends Tokenize {
        tokens: Array<MarkupToken>;
    }

    // JSON Input Interfaces
    type ObjectCSS = Record<string, CSSProperties>;

    interface InputStyles {
        body: ObjectCSS;
        container: ObjectCSS;
        contentBox: ObjectCSS;
        errorMessage: ObjectCSS;
        labels: ObjectCSS;
        labelColumn: ObjectCSS;
        outerBox: ObjectCSS;
        warningBox: ObjectCSS;
    }

    interface ChangeProps {
        plainText: string;
        markupText: string;
        json: string;
        jsObject: ObjectJSON,
        lines: number;
        error?: ErrorMsg;
    }

    interface JSONInputProps {
        locale: Locale,
        id?: string;
        placeholder?: ObjectPlaceholder;
        reset?: boolean;
        viewOnly?: boolean;
        onBlur?: (tokens: ChangeProps) => void;
        onChange?: (changes: ChangeProps) => void;
        modifyErrorText?: (msg: string) => string;
        confirmGood?: boolean;
        height?: string;
        width?: string;
        onKeyPressUpdate?: boolean;
        waitAfterKeyPress?: number;
        theme?: string;
        colors?: Partial<ThemeColors>;
        style?: Partial<InputStyles>;
        error?: ErrorMsg;
    }

    interface JSONInputState {
        prevPlaceholder: undefined|ObjectPlaceholder;
        markupText: string;
        plainText: string;
        json: string;
        jsObject: ObjectJSON;
        lines: number;
        error?: ErrorMsg;
    }

    class JSONInput extends Component<JSONInputProps, JSONInputState> {
        // eslint-disable-next-line react/sort-comp
        constructor(props: JSONInputProps);
        componentDidMount: () => void;
        componentDidUpdate: () => void;
        componentWillUnmount: () => void;
        onBlur: () => void;
        onClick: () => void;
        onKeyDown: (event: KeyboardEvent) => void;
        onKeyPress: (event: KeyboardEvent) => void;
        onPaste: (event: ClipboardEvent) => void;
        onScroll: (event: MouseEvent) => void;
        setCursorPosition: (nextPosition: unknown) => void;
        setUpdateTime: () => void;
        getCursorPosition: (countBR: unknown) => number;
        updateInternalProps: () => void;
        update: (cursorOffset: number, updateCursorPosition: boolean) => void;
        createMarkup: (markupText: string) => { __html: string };
        newSpan: (i: number, token: SimpleToken, depth: number) => string;
        scheduledUpdate: () => void;
        showPlaceholder: () => void;
        stopEvent: (event: SyntheticEvent) => void;
        tokenize: (something: ObjectJSON|HTMLDivElement) => null|DomNodeTokenize|PlaceholderTokenize;
        renderErrorMessage: () => null | HTMLParagraphElement;
        renderLabels: () => Array<HTMLDivElement>;
        render: () => HTMLDivElement;
    }

    export default JSONInput;
}