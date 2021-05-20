// Actions for command API
import { createAction } from 'redux-api-middleware';
import { ActionFailureResult, ActionRequestResult, ActionSuccessResult } from './interfaces';
import { Actuator } from './actuator';
import { withGUIAuth } from './util';

export interface OpenC2Command {
  action: string;
  target: Record<string, any>;
  args?: Record<string, any>;
  actuator?: Record<string, any>;
  command_id?: string;
}
export type OpenC2Response = Record<string, any>

export interface Command {
  actuators: Array<Actuator>;
  command: OpenC2Command;
  command_id: string;
  received_on: string;
  responses: Array<OpenC2Response>;
}

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
}={}) => createAction({
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
    },
    GET_COMMANDS_FAILURE
  ]
});

export interface GetCommandsAction extends ActionSuccessResult {
  type: typeof GET_COMMANDS_SUCCESS;
  payload: {
    count: number;
    next: string;
    previous: string;
    results: Array<Command>;
  };
  meta: {
    sort: string;
    refresh: boolean;
  };
}

// PUT - /api/command/send/ - send command
const SEND_COMMAND_REQUEST = '@@command/SEND_COMMAND_REQUEST';
export const SEND_COMMAND_SUCCESS = '@@command/SEND_COMMAND_SUCCESS';
export const SEND_COMMAND_FAILURE = '@@command/SEND_COMMAND_FAILURE';
export type Channel = { serialization: string; protocol: string; };
export const sendCommand = (command: Command, act: string, chan: Channel) => createAction({
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
});

export interface SendCommandAction extends ActionSuccessResult {
  type: typeof SEND_COMMAND_SUCCESS;
}

// GET - /api/command/{command_id} - get specific command
const GET_COMMAND_REQUEST = '@@command/GET_COMMAND_REQUEST';
export const GET_COMMAND_SUCCESS = '@@command/GET_COMMAND_SUCCESS';
export const GET_COMMAND_FAILURE = '@@command/GET_COMMAND_FAILURE';
export const getCommand = (commandID: string) => createAction({
  endpoint: `${baseAPI}/${commandID}/`,
  method: 'GET',
  headers: withGUIAuth(),
  types: [
    GET_COMMAND_REQUEST, GET_COMMAND_SUCCESS, GET_COMMAND_FAILURE
  ]
});

export interface GetCommandAction extends ActionSuccessResult {
  type: typeof GET_COMMAND_SUCCESS;
  payload: Command;
}

// Request Actions
export interface CommandRequestActions extends ActionRequestResult {
  type: (
    typeof GET_COMMANDS_REQUEST | typeof SEND_COMMAND_REQUEST | typeof GET_COMMAND_REQUEST
  );
}

// Failure Actions
export interface CommandFailureActions extends ActionFailureResult {
  type: (
    typeof GET_COMMANDS_FAILURE | typeof SEND_COMMAND_FAILURE | typeof GET_COMMAND_FAILURE
  );
}

export type CommandActions = (
  CommandRequestActions | CommandFailureActions |
  // Success Actions
  GetCommandsAction | SendCommandAction | GetCommandAction
);