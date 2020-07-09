// Actions for command API
import { RSAA } from 'redux-api-middleware';
import { withGUIAuth } from './util';

// API Base URL
const baseAPI = '/api/command';

// Helper Functions
// None

// API Calls
// GET - /api/command/ - all commands for requesting user
const GET_COMMANDS_REQUEST = '@@command/GET_COMMANDS_REQUEST';
export const GET_COMMANDS_SUCCESS = '@@command/GET_COMMANDS_SUCCESS';
export const GET_COMMANDS_FAILURE = '@@command/GET_COMMANDS_FAILURE';
export const getCommands = ({
  page=1, count=10, sort='name', refresh=false
}={}) => ({
  [RSAA]: {
    endpoint: `${baseAPI}?page=${page}&length=${count}&ordering=${sort}`,
    method: 'GET',
    headers: withGUIAuth(),
    types: [
      GET_COMMANDS_REQUEST,
      {
        type: GET_COMMANDS_SUCCESS,
        meta: {
          sort,
          refresh
        }
      }, GET_COMMANDS_FAILURE
    ]
  }
});

// PUT - /api/command/send/ - send command
const SEND_COMMAND_REQUEST = '@@command/SEND_COMMAND_REQUEST';
export const SEND_COMMAND_SUCCESS = '@@command/SEND_COMMAND_SUCCESS';
export const SEND_COMMAND_FAILURE = '@@command/SEND_COMMAND_FAILURE';
export const sendCommand = (command, act, chan) => ({
  [RSAA]: {
    endpoint: `${baseAPI}/send/`,
    method: 'PUT',
    headers: withGUIAuth(),
    body: JSON.stringify({
      actuator: act,
      command,
      channel: chan
    }),
    types: [
      SEND_COMMAND_REQUEST, SEND_COMMAND_SUCCESS, SEND_COMMAND_FAILURE
    ]
  }
});

// GET - /api/command/{command_id} - get specific command
const GET_COMMAND_REQUEST = '@@command/GET_COMMAND_REQUEST';
export const GET_COMMAND_SUCCESS = '@@command/GET_COMMAND_SUCCESS';
export const GET_COMMAND_FAILURE = '@@command/GET_COMMAND_FAILURE';
export const getCommand = commandID => ({
  [RSAA]: {
    endpoint: `${baseAPI}/${commandID}/`,
    method: 'GET',
    headers: withGUIAuth(),
    types: [
      GET_COMMAND_REQUEST, GET_COMMAND_SUCCESS, GET_COMMAND_FAILURE
    ]
  }
});
