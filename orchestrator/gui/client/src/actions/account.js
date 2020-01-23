// Actions for account API
import { RSAA } from 'redux-api-middleware'
import { withGUIAuth } from './util'

const str_fmt = require('string-format')

// API Base URL
const baseAPI = '/api/account'

// Helper Functions
// None

// API Calls
// GET - /api/account/ - all users
const GET_ACCOUNTS_REQUEST = '@@account/GET_ACCOUNTS_REQUEST'
export const GET_ACCOUNTS_SUCCESS = '@@account/GET_ACCOUNTS_SUCCESS'
export const GET_ACCOUNTS_FAILURE = '@@account/GET_ACCOUNTS_FAILURE'
export const getAccounts = ({page=1, count=10, sort='name', refresh=false}={}) => ({
  [RSAA]: {
    endpoint: str_fmt('{base}?page={page}&length={count}&ordering={sort}', {base: baseAPI, page: page, count: count, sort: sort}),
    method: 'GET',
    headers: withGUIAuth({'Content-Type': 'application/json'}),
    types: [
      GET_ACCOUNTS_REQUEST,
      {
        type: GET_ACCOUNTS_SUCCESS,
        meta: {
          sort: sort,
          refresh: refresh
        }
      }, GET_ACCOUNTS_FAILURE
    ]
  }
})

// POST - /api/account/ - create user (username, password, email, first_name, last_name, is_active, is_staff)
const CREATE_ACCOUNT_REQUEST = '@@account/CREATE_ACCOUNT_REQUEST'
export const CREATE_ACCOUNT_SUCCESS = '@@account/CREATE_ACCOUNT_SUCCESS'
export const CREATE_ACCOUNT_FAILURE = '@@account/CREATE_ACCOUNT_FAILURE'
export const createAccount = (user) => ({
  [RSAA]: {
    endpoint: str_fmt('{base}/', {base: baseAPI}),
    method: 'POST',
    headers: withGUIAuth({'Content-Type': 'application/json'}),
    body: JSON.stringify(user),
    types: [
      CREATE_ACCOUNT_REQUEST, CREATE_ACCOUNT_SUCCESS, CREATE_ACCOUNT_FAILURE
    ]
  }
})

// PATCH - /api/account/{username} - update specific user
const UPDATE_ACCOUNT_REQUEST = '@@account/UPDATE_ACCOUNT_REQUEST'
export const UPDATE_ACCOUNT_SUCCESS = '@@account/UPDATE_ACCOUNT_SUCCESS'
export const UPDATE_ACCOUNT_FAILURE = '@@account/UPDATE_ACCOUNT_FAILURE'
export const updateAccount = (username, user) => ({
  [RSAA]: {
    endpoint: str_fmt('{base}/{username}/', {base: baseAPI, username: username}),
    method: 'PATCH',
    headers: withGUIAuth({'Content-Type': 'application/json'}),
    body: JSON.stringify(user),
    types: [
      UPDATE_ACCOUNT_REQUEST, UPDATE_ACCOUNT_SUCCESS, UPDATE_ACCOUNT_FAILURE
    ]
  }
})

// DELETE - /api/account/{username} - delete specific user
const DELETE_ACCOUNT_REQUEST = '@@account/DELETE_ACCOUNT_REQUEST'
export const DELETE_ACCOUNT_SUCCESS = '@@account/DELETE_ACCOUNT_SUCCESS'
export const DELETE_ACCOUNT_FAILURE = '@@account/DELETE_ACCOUNT_FAILURE'
export const deleteAccount = (username) => ({
  [RSAA]: {
    endpoint: str_fmt('{base}/{username}/', {base: baseAPI, username: username}),
    method: 'DELETE',
    headers: withGUIAuth({'Content-Type': 'application/json'}),
    types: [
      DELETE_ACCOUNT_REQUEST, DELETE_ACCOUNT_SUCCESS, DELETE_ACCOUNT_FAILURE
    ]
  }
})

// POST - /api/account/{username}/change_password - change specific users password
const CHANGE_ACCOUNT_PASSWORD_REQUEST = '@@account/CHANGE_ACCOUNT_PASSWORD_REQUEST'
export const CHANGE_ACCOUNT_PASSWORD_SUCCESS = '@@account/CHANGE_ACCOUNT_PASSWORD_SUCCESS'
export const CHANGE_ACCOUNT_PASSWORD_FAILURE = '@@account/CHANGE_ACCOUNT_PASSWORD_FAILURE'
export const changeAccountPassword = (username, old_pass, new_pass1, new_pass2) => ({
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
      CHANGE_ACCOUNT_PASSWORD_REQUEST, CHANGE_ACCOUNT_PASSWORD_SUCCESS, CHANGE_ACCOUNT_PASSWORD_FAILURE
    ]
  }
})
