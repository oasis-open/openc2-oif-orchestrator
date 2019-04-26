import { RSAA } from 'redux-api-middleware'

const str_fmt = require('string-format')

// General Actions

import { withGUIAuth, withOrcAuth, withOrcURL } from './util'

// API Base URL
const baseAPI = '/api/account'

// Helper Functions


// API Calls
// GET - /api/account/ - all users
const GET_USERS_REQUEST = '@@auth/GET_USERS_REQUEST'
export const GET_USERS_SUCCESS = '@@auth/GET_USERS_SUCCESS'
export const GET_USERS_FAILURE = '@@auth/GET_USERS_FAILURE'
export const getUsers = (page=1, count=10) => ({
    [RSAA]: {
        endpoint:str_fmt('{base}/?page={page}&length={count}', {base: baseAPI, page: page, count: count}),
        method: 'GET',
        headers: withGUIAuth({'Content-Type': 'application/json'}),
        types: [
            GET_USERS_REQUEST, GET_USERS_SUCCESS, GET_USERS_FAILURE
        ]
    }
})

// POST - /api/account/ - create user (username, password, email, first_name, last_name, is_active, is_staff)
const CREATE_USER_REQUEST = '@@auth/CREATE_USER_REQUEST'
export const CREATE_USER_SUCCESS = '@@auth/CREATE_USER_SUCCESS'
export const CREATE_USER_FAILURE = '@@auth/CREATE_USER_FAILURE'
export const createUser = (user) => ({
    [RSAA]: {
        endpoint: str_fmt('{base}/', {base: baseAPI}),
        method: 'POST',
        headers: withGUIAuth({'Content-Type': 'application/json'}),
        body: JSON.stringify(user),
        types: [
            CREATE_USER_REQUEST, CREATE_USER_SUCCESS, CREATE_USER_FAILURE
        ]
    }
})

// GET - /api/account/{username} - specific user
const GET_USER_REQUEST = '@@auth/GET_USER_REQUEST'
export const GET_USER_SUCCESS = '@@auth/GET_USER_SUCCESS'
export const GET_USER_FAILURE = '@@auth/GET_USER_FAILURE'
export const getUser = (username) => ({
    [RSAA]: {
        endpoint: str_fmt('{base}/{username}/', {base: baseAPI, username: username}),
        method: 'GET',
        headers: withGUIAuth({'Content-Type': 'application/json'}),
        types: [
            GET_USER_REQUEST, GET_USER_SUCCESS, GET_USER_FAILURE
        ]
    }
})

// PUT - /api/account/{username} - create specific user (username, password, email, first_name, last_name, is_active, is_staff)
export const createUserName = (username, user) => ({
    [RSAA]: {
        endpoint: str_fmt('/api/account/{username}/', {base: baseAPI, username: username}),
        method: 'PUT',
        headers: withGUIAuth({'Content-Type': 'application/json'}),
        body: JSON.stringify(user),
        types: [
            CREATE_USER_REQUEST, CREATE_USER_SUCCESS, CREATE_USER_FAILURE
        ]
    }
})

// PATCH - /api/account/{username} - update specific user
const UPDATE_USER_REQUEST = '@@auth/UPDATE_USER_REQUEST'
export const UPDATE_USER_SUCCESS = '@@auth/UPDATE_USER_SUCCESS'
export const UPDATE_USER_FAILURE = '@@auth/UPDATE_USER_FAILURE'
export const updateUser = (username, user) => ({
    [RSAA]: {
        endpoint: str_fmt('{base}/{username}/', {base: baseAPI, username: username}),
        method: 'PUT',
        headers: withGUIAuth({'Content-Type': 'application/json'}),
        body: JSON.stringify(user),
        types: [
            CREATE_USER_REQUEST, CREATE_USER_SUCCESS, CREATE_USER_FAILURE
        ]
    }
})

// DELETE - /api/account/{username} - delete specific user
const DELETE_USER_REQUEST = '@@auth/DELETE_USER_REQUEST'
export const DELETE_USER_SUCCESS = '@@auth/DELETE_USER_SUCCESS'
export const DELETE_USER_FAILURE = '@@auth/DELETE_USER_FAILURE'
export const deleteUser = (username) => ({
    [RSAA]: {
        endpoint: str_fmt('{base}/{username}/', {base: baseAPI, username: username}),
        method: 'DELETE',
        headers: withGUIAuth({'Content-Type': 'application/json'}),
        types: [
            DELETE_USER_REQUEST, DELETE_USER_SUCCESS, DELETE_USER_FAILURE
        ]
    }
})

// POST - /api/account/{username}/change_password - change specific users password
const CHANGE_USER_PASSWORD_REQUEST = '@@auth/CHANGE_USER_PASSWORD_REQUEST'
export const CHANGE_USER_PASSWORD_SUCCESS = '@@auth/CHANGE_USER_PASSWORD_SUCCESS'
export const CHANGE_USER_PASSWORD_FAILURE = '@@auth/CHANGE_USER_PASSWORD_FAILURE'
export const changeUserPassword = (username, old_pass, new_pass1, new_pass2) => ({
    [RSAA]: {
        endpoint: str_fmt('{base}/{username}/change_password/', {base: baseAPI, username: username}),
        method: 'POST',
        headers: withGUIAuth({'Content-Type': 'application/json'}),
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

// GET - /api/account/{username}/actuator/ - all actuator the user can access
const GET_USER_ACTUATORS_REQUEST = '@@auth/GET_USER_ACTUATORS_REQUEST'
export const GET_USER_ACTUATORS_SUCCESS = '@@auth/GET_USER_ACTUATORS_SUCCESS'
export const GET_USER_ACTUATORS_FAILURE = '@@auth/GET_USER_ACTUATORS_FAILURE'
export const getUserActuators = (username) => ({
    [RSAA]: {
        endpoint: str_fmt('{base}/{username}/actuator/', {base: baseAPI, username: username}),
        method: 'GET',
        headers: withGUIAuth({'Content-Type': 'application/json'}),
        types: [
            CREATE_USER_ACTUATORS_REQUEST, CREATE_USER_ACTUATORS_SUCCESS, CREATE_USER_ACTUATORS_FAILURE
        ]
    }
})

// TODO: Finalize body format
// PUT - /api/account/{username}/actuator/ - add actuator to user access - (actuator)
const ADD_USER_ACTUATORS_REQUEST = '@@auth/ADD_USER_ACTUATORS_REQUEST'
export const ADD_USER_ACTUATORS_SUCCESS = '@@auth/ADD_USER_ACTUATORS_SUCCESS'
export const ADD_USER_ACTUATORS_FAILURE = '@@auth/ADD_USER_ACTUATORS_FAILURE'
export const addUserActuators = (username) => ({
    [RSAA]: {
        endpoint: str_fmt('{base}/{username}/actuator/', {base: baseAPI, username: username}),
        method: 'PUT',
        headers: withGUIAuth({'Content-Type': 'application/json'}),
        body: JSON.stringify({}),
        types: [
            ADD_USER_ACTUATORS_REQUEST, ADD_USER_ACTUATORS_SUCCESS, ADD_USER_ACTUATORS_FAILURE
        ]
    }
})

// DELETE - /api/account/{username}/actuator/{actuator} - delete access to an actuator
const DELETE_USER_ACTUATOR_REQUEST = '@@auth/DELETE_USER_ACTUATOR_REQUEST'
export const DELETE_USER_ACTUATOR_SUCCESS = '@@auth/DELETE_USER_ACTUATOR_SUCCESS'
export const DELETE_USER_ACTUATOR_FAILURE = '@@auth/DELETE_USER_ACTUATOR_FAILURE'
export const deleteUserActuator = (username, actuator) => ({
    [RSAA]: {
        endpoint: str_fmt('{base}/{username}/actuator/{actuator}/', {base: baseAPI, username: username, actuator: actuator}),
        method: 'DELETE',
        headers: withGUIAuth({'Content-Type': 'application/json'}),
        types: [
            DELETE_USER_ACTUATOR_REQUEST,  DELETE_USER_ACTUATOR_SUCCESS,  DELETE_USER_ACTUATOR_FAILURE
        ]
    }
})

// GET - /api/account/{username}/history/ - view account command history
const GET_USER_HISTORY_REQUEST = '@@auth/GET_USER_HISTORY_REQUEST'
export const GET_USER_HISTORY_SUCCESS = '@@auth/GET_USER_HISTORY_SUCCESS'
export const GET_USER_HISTORY_FAILURE = '@@auth/GET_USER_HISTORY_FAILURE'
export const getUserHistory = (username) => ({
    [RSAA]: {
        endpoint: str_fmt('{base}/{username}/history/', {base: baseAPI, username: username}),
        method: 'GET',
        headers: withGUIAuth({'Content-Type': 'application/json'}),
        types: [
            GET_USER_HISTORY_REQUEST, GET_USER_HISTORY_SUCCESS, GET_USER_HISTORY_FAILURE
        ]
    }
})

// GET - /api/account/{username}/history/{command_id} - view account specific command history
const GET_USER_COMMAND_REQUEST = '@@auth/GET_USER_COMMAND_REQUEST'
export const GET_USER_COMMAND_SUCCESS = '@@auth/GET_USER_COMMAND_SUCCESS'
export const GET_USER_COMMAND_FAILURE = '@@auth/GET_USER_COMMAND_FAILURE'
export const getUserCommand = (username, command_id) => ({
    [RSAA]: {
        endpoint: str_fmt('{base}/{username}/history/{command_id}', {base: baseAPI, username: username, command_id: command_id}),
        method: 'GET',
        headers: withGUIAuth({'Content-Type': 'application/json'}),
        types: [
            GET_USER_COMMAND_REQUEST, GET_USER_COMMAND_SUCCESS, GET_USER_COMMAND_FAILURE
        ]
    }
})
