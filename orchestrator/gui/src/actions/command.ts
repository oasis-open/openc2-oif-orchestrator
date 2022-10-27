// Actions for command API
import { createAction } from 'redux-api-middleware';
import { ActionFailureResult, ActionRequestResult, ActionSuccessResult } from './interfaces';
import { Actuator } from './actuator';
import { withGUIAuth } from './util';

// Command Typing
type OpenC2Action = (
  'scan' |        // Systematic examination of some aspect of the entity or its environment
  'locate' |      // Find an object physically, logically, functionally, or by organization
  'query' |       // Initiate a request for information
  'deny' |        // Prevent a certain event or action from completion, such as preventing a flow from reaching a destination or preventing access
  'contain' |     // Isolate a file, process, or entity so that it cannot modify or access assets or processes
  'allow' |       // Permit access to or execution of a Target
  'start' |       // Initiate a process, application, system, or activity
  'stop' |        // Halt a system or end an activity
  'restart' |     // Stop then start a system or an activity
  'cancel' |      // Invalidate a previously issued Action
  'set' |         // Change a value, configuration, or state of a managed entity
  'update' |      // Instruct a component to retrieve, install, process, and operate in accordance with a software update, reconfiguration, or other update
  'redirect' |    // Change the flow of traffic to a destination other than its original destination
  'create' |      // Add a new entity of a known type (e.g., data, files, directories)
  'delete' |      // Remove an entity (e.g., data, files, flows)
  'detonate' |    // Execute and observe the behavior of a Target (e.g., file, hyperlink) in an isolated environment
  'restore' |     // Return a system to a previously known state
  'copy' |        // Duplicate an object, file, data flow, or artifact
  'investigate' | // Task the recipient to aggregate and report information as it pertains to a security event or incident
  'remediate'     // Task the recipient to eliminate a vulnerability or attack point
);

export interface OpenC2Command {
  action: OpenC2Action;
  target: Record<string, any>;
  args?: Record<string, any>;
  actuator?: Record<string, any>;
  command_id?: string;
}

// Response Typing
export interface OpenC2Response {
  status: number;
  status_text?: string;
  resutls: Record<string, any>;
}

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