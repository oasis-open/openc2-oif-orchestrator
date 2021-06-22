declare module 'react-json-editor-ajrm/themes' {
    export interface ThemeColors {
        background: string;
        background_warning: string;
        colon: string;
        default: string;
        error?: string;
        keys: string;
        keys_whiteSpace: string;
        number: string;
        primitive: string;
        string: string;
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface themes {
        dark_vscode_tribute: ThemeColors,
        light_mitsuketa_tribute:ThemeColors
    }

    export default themes;
}