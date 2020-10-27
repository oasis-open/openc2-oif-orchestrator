// Actions for account API
import { RSAA } from 'redux-api-middleware';
import { withGUIAuth } from './util';

// API Base URL
const baseAPI = '/api/account';

// Helper Functions
// None

// API Calls
// POST - /api/account/{username}/change_password - change specific users password
const CHANGE_ACCOUNT_PASSWORD_REQUEST = '@@account/CHANGE_ACCOUNT_PASSWORD_REQUEST';
export const CHANGE_ACCOUNT_PASSWORD_SUCCESS = '@@account/CHANGE_ACCOUNT_PASSWORD_SUCCESS';
export const CHANGE_ACCOUNT_PASSWORD_FAILURE = '@@account/CHANGE_ACCOUNT_PASSWORD_FAILURE';
export const changeAccountPassword = (username, oldPass, newPass1, newPass2) => ({
  [RSAA]: {
    endpoint: `${baseAPI}/${username}/change_password/`,
    method: 'POST',
    headers: withGUIAuth(),
    body: JSON.stringify({
      old_password: oldPass || '',
      new_password_1: newPass1 || '',
      new_password_2: newPass2 || ''
    }),
    types: [
      CHANGE_ACCOUNT_PASSWORD_REQUEST, CHANGE_ACCOUNT_PASSWORD_SUCCESS, CHANGE_ACCOUNT_PASSWORD_FAILURE
    ]
  }
});
