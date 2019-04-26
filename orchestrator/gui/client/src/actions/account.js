import { RSAA } from 'redux-api-middleware'

import { withGUIAuth } from './util'

const str_fmt = require('string-format')

// API Base URL
const baseAPI = '/api/account'

// Helper Functions

// API Calls
// POST - /api/account/{username}/change_password - change specific users password
const CHANGE_USER_PASSWORD_REQUEST = '@@auth/CHANGE_USER_PASSWORD_REQUEST'
export const CHANGE_USER_PASSWORD_SUCCESS = '@@auth/CHANGE_USER_PASSWORD_SUCCESS'
export const CHANGE_USER_PASSWORD_FAILURE = '@@auth/CHANGE_USER_PASSWORD_FAILURE'
export const changeUserPassword = (username, old_pass, new_pass1, new_pass2) => ({
    [RSAA]: {
        endpoint: str_fmt('{base}/{username}/change_password/', {base: baseAPI, username: username}),
        method: 'POST',
        headers: withGUIAuth(),
        body: JSON.stringify({
            old_password: old_pass || '',
            new_password_1: new_pass1 || '',
            new_password_2: new_pass2 || ''
        }),
        types: [
            CHANGE_USER_PASSWORD_REQUEST, CHANGE_USER_PASSWORD_SUCCESS, CHANGE_USER_PASSWORD_FAILURE
        ]
    }
})
