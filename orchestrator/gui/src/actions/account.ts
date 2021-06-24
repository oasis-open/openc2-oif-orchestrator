// Actions for account API
import { createAction } from 'redux-api-middleware';
import { ActionFailureResult, ActionRequestResult, ActionSuccessResult } from './interfaces';
import { withGUIAuth } from './util';

// TODO: add proper typing for Account
export interface Account {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  token: string;
  is_active: boolean;
  is_staff: boolean;
  auth_groups: Array<string>;
  actuator_groups: Array<string>;
  device_groups: Array<string>;
}

// API Base URL
const baseAPI = '/api/account';

// Helper Functions
// None

// API Calls
// POST - /api/account/{username}/change_password - change specific users password
const CHANGE_PASSWORD_REQUEST = '@@account/CHANGE_ACCOUNT_PASSWORD_REQUEST';
export const CHANGE_PASSWORD_SUCCESS = '@@account/CHANGE_ACCOUNT_PASSWORD_SUCCESS';
export const CHANGE_PASSWORD_FAILURE = '@@account/CHANGE_ACCOUNT_PASSWORD_FAILURE';
export const changeAccountPassword = (username: string, oldPass: string, newPass1: string, newPass2: string) => createAction({
  endpoint: `${baseAPI}/${username}/change_password/`,
  method: 'POST',
  headers: withGUIAuth(),
  body: JSON.stringify({
    old_password: oldPass,
    new_password_1: newPass1,
    new_password_2: newPass2
  }),
  types: [
    CHANGE_PASSWORD_REQUEST, CHANGE_PASSWORD_SUCCESS, CHANGE_PASSWORD_FAILURE
  ]
});

export interface ChangeAccountPasswordActions extends ActionSuccessResult {
  type: typeof CHANGE_PASSWORD_SUCCESS;
  payload: {
    status: string;
    statusText: string;
  };
}

// Request Actions
export interface AccountRequestActions extends ActionRequestResult {
  type: typeof CHANGE_PASSWORD_REQUEST;
}

// Failure Actions
export interface AccountFailureActions extends ActionFailureResult {
  type: typeof CHANGE_PASSWORD_FAILURE;
}

export type AccountActions = (
  AccountRequestActions | AccountFailureActions |
  // Success Actions
  ChangeAccountPasswordActions
);