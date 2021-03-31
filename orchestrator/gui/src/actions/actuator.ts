// Actions for actuator API
import { createAction } from 'redux-api-middleware';
import { JSONSchema7 } from 'json-schema';
import { ActionFailureResult, ActionRequestResult, ActionSuccessResult } from './interfaces';
import { withGUIAuth } from './util';

export interface Actuator {
  actuator_id: string;
  name: string;
  device: string;
  profile: string;
  schema: JSONSchema7;
}

// API Base URL
const baseAPI = '/api/actuator';

// Helper Functions
// None

// API Calls
// GET - /api/actuator/ - all actuators
const GET_ACTUATORS_REQUEST = '@@actuator/GET_ACTUATORS_REQUEST';
export const GET_ACTUATORS_SUCCESS = '@@actuator/GET_ACTUATORS_SUCCESS';
export const GET_ACTUATORS_FAILURE = '@@actuator/GET_ACTUATORS_FAILURE';
export const getActuators = ({
  page=1, count=10, sort='name', refresh=false
}={}) => createAction({
  endpoint: `${baseAPI}?page=${page}&length=${count}&ordering=${sort}`,
  method: 'GET',
  headers: withGUIAuth({'Content-Type': 'application/json'}),
  types: [
    GET_ACTUATORS_REQUEST,
    {
      type: GET_ACTUATORS_SUCCESS,
      meta: {
        sort,
        refresh
      }
    },
    GET_ACTUATORS_FAILURE
  ]
});

export interface GetActuatorsAction extends ActionSuccessResult {
  type: typeof GET_ACTUATORS_SUCCESS;
  payload: {
    count: number;
    next: string;
    previous: string;
    results: Array<Actuator>;
  };
  meta: {
    sort: string;
    refresh: boolean;
  };
}

// POST - /api/actuator/ - create actuator (name, host, port, protocol, serialization, profile)
const CREATE_ACTUATOR_REQUEST = '@@actuator/CREATE_ACTUATOR_REQUEST';
export const CREATE_ACTUATOR_SUCCESS = '@@actuator/CREATE_ACTUATOR_SUCCESS';
export const CREATE_ACTUATOR_FAILURE = '@@actuator/CREATE_ACTUATOR_FAILURE';
export const createActuator = (actuator: Actuator) => createAction({
  endpoint: `${baseAPI}/`,
  method: 'POST',
  headers: withGUIAuth(),
  body: JSON.stringify(actuator),
  types: [
    CREATE_ACTUATOR_REQUEST, CREATE_ACTUATOR_SUCCESS, CREATE_ACTUATOR_FAILURE
  ]
});

export interface CreateActuatorAction extends ActionSuccessResult {
  type: typeof CREATE_ACTUATOR_SUCCESS;
  payload: Actuator;
}

// GET - /api/actuator/{name} - specific actuators
const GET_ACTUATOR_REQUEST = '@@actuator/GET_ACTUATOR_REQUEST';
export const GET_ACTUATOR_SUCCESS = '@@actuator/GET_ACTUATOR_SUCCESS';
export const GET_ACTUATOR_FAILURE = '@@actuator/GET_ACTUATOR_FAILURE';
export const getActuator = (actuatorUUID: string) => createAction({
  endpoint: `${baseAPI}/${actuatorUUID}/`,
  method: 'GET',
  headers: withGUIAuth(),
  types: [
    GET_ACTUATOR_REQUEST, GET_ACTUATOR_SUCCESS, GET_ACTUATOR_FAILURE
  ]
});

export interface GetActuatorAction extends ActionSuccessResult {
  type: typeof GET_ACTUATOR_SUCCESS;
  payload: Actuator;
}

// PATCH - /api/actuator/{name} - update specific actuator (name, host, port, protocol, serialization, profile)
const UPDATE_ACTUATOR_REQUEST = '@@actuator/UPDATE_ACTUATOR_REQUEST';
export const UPDATE_ACTUATOR_SUCCESS = '@@actuator/UPDATE_ACTUATOR_SUCCESS';
export const UPDATE_ACTUATOR_FAILURE = '@@actuator/UPDATE_ACTUATOR_FAILURE';
export const updateActuator = (actuatorUUID: string, actuator: Actuator) => createAction({
  endpoint: `${baseAPI}/${actuatorUUID}/`,
  method: 'PATCH',
  headers: withGUIAuth(),
  body: JSON.stringify(actuator),
  types: [
    UPDATE_ACTUATOR_REQUEST, UPDATE_ACTUATOR_SUCCESS, UPDATE_ACTUATOR_FAILURE
  ]
});

export interface UpdateActuatorAction extends ActionSuccessResult {
  type: typeof UPDATE_ACTUATOR_SUCCESS;
  payload: Actuator;
}

// DELETE - /api/actuator/{name} - delete specific actuator
const DELETE_ACTUATOR_REQUEST = '@@actuator/DELETE_ACTUATOR_REQUEST';
export const DELETE_ACTUATOR_SUCCESS = '@@actuator/DELETE_ACTUATOR_SUCCESS';
export const DELETE_ACTUATOR_FAILURE = '@@actuator/DELETE_ACTUATOR_FAILURE';
export const deleteActuator = (actuatorUUID: string) => createAction({
  endpoint: `${baseAPI}/${actuatorUUID}/`,
  method: 'DELETE',
  headers: withGUIAuth(),
  types: [
    DELETE_ACTUATOR_REQUEST,  DELETE_ACTUATOR_SUCCESS,  DELETE_ACTUATOR_FAILURE
  ]
});

export interface DeleteActuatorAction extends ActionSuccessResult {
  type: typeof DELETE_ACTUATOR_SUCCESS;
}

// Request Actions
export interface ActuatorRequestActions extends ActionRequestResult {
  type: (
    typeof GET_ACTUATORS_REQUEST | typeof CREATE_ACTUATOR_REQUEST | typeof GET_ACTUATOR_REQUEST |
    typeof UPDATE_ACTUATOR_REQUEST | typeof DELETE_ACTUATOR_REQUEST
  );
}

// Failure Actions
export interface ActuatorFailureActions extends ActionFailureResult {
  type: (
    typeof GET_ACTUATORS_FAILURE | typeof CREATE_ACTUATOR_FAILURE | typeof GET_ACTUATOR_FAILURE
    | typeof UPDATE_ACTUATOR_FAILURE | typeof DELETE_ACTUATOR_FAILURE
  );
}

export type ActuatorActions = (
  ActuatorRequestActions | ActuatorFailureActions |
  // Success Actions
  GetActuatorsAction | CreateActuatorAction | GetActuatorAction | UpdateActuatorAction | DeleteActuatorAction
);