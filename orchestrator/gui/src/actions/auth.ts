// Actions for auth API - account login/logout and token refresh
import { createAction } from 'redux-api-middleware';
import {
  ActionFailureResult, ActionRequestResult, ActionSuccessResult, MinimalAction
} from './interfaces';

type RootState = Record<string, any>

// API Base URL
const baseAPI = '/api/account';

// General Actions
export const TOKEN_FAILURE = '@@auth/TOKEN_FAILURE';

// Helper Functions
const isTokenExpired = (state: RootState) => {
 if (state.access && state.access.exp) {
  return 1000 * state.access.exp - (new Date()).getTime() < 5000;
 }
 return true;
};

export const isAuthenticated = (state: RootState) => {
  return !isTokenExpired(state);
};

// API Calls
// POST - /api/account/jwt/ - get JSON Web Token
const LOGIN_REQUEST = '@@auth/LOGIN_REQUEST';
export const LOGIN_SUCCESS = '@@auth/LOGIN_SUCCESS';
export const LOGIN_FAILURE = '@@auth/LOGIN_FAILURE';
export const login = (username: string, password: string) => createAction({
  endpoint: `${baseAPI}/jwt/`,
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({ username, password }),
  types: [
    LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE
  ]
});

export  interface LoginAction extends ActionSuccessResult {
  type: typeof LOGIN_SUCCESS;
  payload: {
    token: string;
  }
}

// Logout
// N/A - N/A - logout
export const LOGOUT = '@@auth/LOGIN';
export const logout = (): MinimalAction => ({
  type: LOGOUT,
  asyncDispatch: () => {}
});

export interface LogoutAction extends ActionSuccessResult {
  type: typeof LOGOUT;
  payload: {
    token: string;
  }
}

// POST - /api/account/jwt/refresh/ - refresh JSON Web Token
export const TOKEN_REFRESH = '@@auth/TOKEN_REFRESH';
export const TOKEN_REFRESHED = '@@auth/TOKEN_REFRESHED';
export const refreshAccessToken = (token: string) => createAction({
  endpoint: `${baseAPI}/jwt/refresh/`,
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({ token }),
  types: [
    TOKEN_REFRESH, TOKEN_REFRESHED, TOKEN_FAILURE
  ]
});

export interface TokenRefreshAction extends ActionSuccessResult {
  type: typeof TOKEN_REFRESHED;
}

// Request Actions
export interface AuthRequestActions extends ActionRequestResult {
  type: (
    typeof LOGIN_REQUEST | typeof TOKEN_REFRESH
  );
}

// Failure Actions
export interface AuthFailureActions extends ActionFailureResult {
  type: (
    typeof LOGIN_FAILURE | typeof TOKEN_FAILURE
  );
}

export type AuthActions = (
  AuthRequestActions | AuthFailureActions |
  // Success Actions
  LogoutAction | LoginAction | TokenRefreshAction
);