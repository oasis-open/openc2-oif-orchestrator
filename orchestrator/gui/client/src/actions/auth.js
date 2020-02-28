// Actions for auth API - account login/logout and token refresh
import { RSAA } from 'redux-api-middleware';

// API Base URL
const baseAPI = '/api/account';

// General Actions
export const TOKEN_FAILURE = '@@auth/TOKEN_FAILURE';

// Helper Functions
const isTokenExpired = state => {
 if (state.access && state.access.exp) {
  return 1000 * state.access.exp - (new Date()).getTime() < 5000;
 }
 return true;
};

export const isAuthenticated = (state) => {
  return !isTokenExpired(state);
};

// Logout
export const LOGOUT_REQUEST = '@@auth/LOGIN_REQUEST';
export const LOGOUT_SUCCESS = '@@auth/LOGIN_SUCCESS';
export const LOGOUT_FAILURE = '@@auth/LOGIN_FAILURE';
export const logout = () => ({
  [RSAA]: {
    types: [
      LOGOUT_REQUEST, LOGOUT_SUCCESS, LOGOUT_FAILURE
    ]
  }
});

// API Calls
// POST - /api/account/jwt/ - get JSON Web Token
const LOGIN_REQUEST = '@@auth/LOGIN_REQUEST';
export const LOGIN_SUCCESS = '@@auth/LOGIN_SUCCESS';
export const LOGIN_FAILURE = '@@auth/LOGIN_FAILURE';
export const login = (username, password) => ({
  [RSAA]: {
    endpoint: `${baseAPI}/jwt/`,
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ username, password }),
    types: [
      LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE
    ]
  }
});

// POST - /api/account/jwt/refresh/ - refresh JSON Web Token
export const TOKEN_REFRESH = '@@auth/TOKEN_REFRESH';
export const TOKEN_REFRESHED = '@@auth/TOKEN_REFRESHED';
export const refreshAccessToken = (token) => ({
  [RSAA]: {
    endpoint: `${baseAPI}/jwt/refresh/`,
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ token }),
    types: [
      TOKEN_REFRESH, TOKEN_REFRESHED, TOKEN_FAILURE
    ]
  }
});