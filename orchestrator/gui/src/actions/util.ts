// Actions for utility endpoints
import { createAction } from 'redux-api-middleware';
import { ActionFailureResult, ActionRequestResult, ActionSuccessResult } from './interfaces';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RootState = Record<string, any>

// Helper Functions
export const withGUIAuth = (headers={}) => {
  return (state: RootState) => ({
    ...headers,
    'Authorization': `JWT ${ state.Auth.access.token || '' }`,
    'Content-Type': 'application/json'
  });
};

// API Calls
// GET - /api/
const INFO_REQUEST = '@@util/INFO_REQUEST';
export const INFO_SUCCESS = '@@util/INFO_SUCCESS';
export const INFO_FAILURE = '@@util/INFO_FAILURE';
export const info = () => createAction({
  endpoint: '/api/',
  method: 'GET',
  types: [
    INFO_REQUEST, INFO_SUCCESS, INFO_FAILURE
  ]
});

export interface InfoAction extends ActionSuccessResult {
  type: typeof INFO_SUCCESS;
  payload: {
    message: string;
    commands: {
        sent: number;
        responses: number;
    };
    name: string;
    id: string;
    protocols: {
      [protocol: string]: boolean;
    };
    serializations: Array<string>;
  };
}

// Request Actions
export interface UtilRequestActions extends ActionRequestResult {
  type: typeof INFO_REQUEST;
}

// Failure Actions
export interface UtilFailureActions extends ActionFailureResult {
  type: typeof INFO_FAILURE;
}

export type UtilActions = (
  UtilRequestActions | UtilFailureActions |
  // Success Actions
  InfoAction
);