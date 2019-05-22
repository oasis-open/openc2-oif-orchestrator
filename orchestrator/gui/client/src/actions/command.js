import { RSAA } from 'redux-api-middleware'

import { withGUIAuth } from './util'

const str_fmt = require('string-format')

// API Base URL
const baseAPI = '/api/command'

// Helper Functions

// API Calls
// GET - /api/command/ - all commands for requesting user
const GET_COMMANDS_REQUEST = '@@command/GET_COMMANDS_REQUEST'
export const GET_COMMANDS_SUCCESS = '@@command/GET_COMMANDS_SUCCESS'
export const GET_COMMANDS_FAILURE = '@@command/GET_COMMANDS_FAILURE'
export const getCommands = ({page=1, count=10, sort='name', refresh=false}={}) => ({
    [RSAA]: {
        endpoint: str_fmt('{base}?page={page}&length={count}&ordering={sort}', {base: baseAPI, page: page, count: count, sort: sort}),
        method: 'GET',
        headers: withGUIAuth(),
        types: [
            GET_COMMANDS_REQUEST,
            {
                type: GET_COMMANDS_SUCCESS,
                meta: {
                    sort: sort,
                    refresh: refresh
                }
            }, GET_COMMANDS_FAILURE
        ]
    }
})

// PUT - /api/command/send/ - send command
const SEND_COMMAND_REQUEST = '@@command/SEND_COMMAND_REQUEST'
export const SEND_COMMAND_SUCCESS = '@@command/SEND_COMMAND_SUCCESS'
export const SEND_COMMAND_FAILURE = '@@command/SEND_COMMAND_FAILURE'
export const sendCommand = (command, act, chan) => ({
    [RSAA]: {
        endpoint: str_fmt('{base}/send/', {base: baseAPI}),
        method: 'PUT',
        headers: withGUIAuth(),
        body: JSON.stringify({
            actuator: act,
            command: command,
            channel: chan
        }),
        types: [
            SEND_COMMAND_REQUEST, SEND_COMMAND_SUCCESS, SEND_COMMAND_FAILURE
        ]
    }
})

// GET - /api/command/{command_id} - get specific command
const GET_COMMAND_REQUEST = '@@command/GET_COMMAND_REQUEST'
export const GET_COMMAND_SUCCESS = '@@command/GET_COMMAND_SUCCESS'
export const GET_COMMAND_FAILURE = '@@command/GET_COMMAND_FAILURE'
export const getCommand = (command_id) => ({
    [RSAA]: {
        endpoint: str_fmt('{base}/{command_id}/', {base: baseAPI, command_id: command_id}),
        method: 'GET',
        headers: withGUIAuth(),
        types: [
            GET_COMMAND_REQUEST, GET_COMMAND_SUCCESS, GET_COMMAND_FAILURE
        ]
    }
})

