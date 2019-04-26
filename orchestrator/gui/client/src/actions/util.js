import { RSAA } from 'redux-api-middleware';

const str_fmt = require('string-format')

// Helper Functions
export const withGUIAuth = (headers={}) => {
    return (state) => ({
        ...headers,
        'Authorization': str_fmt('JWT {token}', {token: state.Auth.access.token || ''}),
        'Content-Type': 'application/json'
    })
}

// API Calls
// GET - /api/
const INFO_REQUEST = '@@util/INFO_REQUEST';
export const INFO_SUCCESS = '@@util/INFO_SUCCESS';
export const INFO_FAILURE = '@@util/INFO_FAILURE';
export const info = () => ({
    [RSAA]: {
        endpoint: '/api/',
        method: 'GET',
        types: [
            INFO_REQUEST, INFO_SUCCESS, INFO_FAILURE
        ]
    }
})
