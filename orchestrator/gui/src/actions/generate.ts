// Actions for client side generate page
import { createAction } from 'redux-api-middleware';
import { JSONSchema7 } from 'json-schema';
import {
  ActionFailureResult, ActionRequestResult, ActionSuccessResult, MinimalAction
} from './interfaces';
import { withGUIAuth } from './util';

// Helper Functions
// N/A - N/A - set schema locally
export const SCHEMA_DEFINE = '@@generate/SCHEMA_DEFINE';
export const setSchema = (schema: JSONSchema7): MinimalAction => ({
  type: {
    type: SCHEMA_DEFINE,
    meta: {
      schema
    }
  },
  asyncDispatch: () => {}
});

export interface SetSchemaAction extends ActionSuccessResult {
  type: typeof SCHEMA_DEFINE;
  meta: {
    schema: JSONSchema7;
  };
}

// API Calls
// GET - /api/actuator?fields=actuator_id,name,profile,device - get base info of all actuators
const ACTUATOR_INFO_REQUEST = '@@generate/ACTUATOR_INFO_REQUEST';
export const ACTUATOR_INFO_SUCCESS = '@@generate/ACTUATOR_INFO_SUCCESS';
export const ACTUATOR_INFO_FAILURE = '@@generate/ACTUATOR_INFO_FAILURE';
export const actuatorInfo = (fields=['actuator_id', 'name', 'profile', 'device'], page=1, count=10) => createAction({
  endpoint: `/api/actuator?fields=${fields.join(',')}&page=${page}&length=${count}`,
  method: 'GET',
  headers: withGUIAuth(),
  types: [
    ACTUATOR_INFO_REQUEST,
    {
      type: ACTUATOR_INFO_SUCCESS,
      meta: {
        fields,
        page: count === 10 ? 1 : page+1,
        count
      }
    },
    ACTUATOR_INFO_FAILURE
  ]
});

export interface ActuatorInfoAction extends ActionSuccessResult {
  type: typeof ACTUATOR_INFO_SUCCESS;
  meta: {
    fields: Array<string>;
    page: number;
    count: number;
  };
}

// GET - /api/actuator?fields=actuator_id,name,profile - get base info of all actuators
const ACTUATOR_SELECT_REQUEST = '@@generate/ACTUATOR_SELECT_REQUEST';
export const ACTUATOR_SELECT_SUCCESS = '@@generate/ACTUATOR_SELECT_SUCCESS';
export const ACTUATOR_SELECT_FAILURE = '@@generate/ACTUATOR_SELECT_FAILURE';
export const actuatorSelect = (actUUID: string, type: 'actuator' | 'profile' ='actuator') => createAction({
  endpoint: `/api/actuator/${actUUID}/?fields=schema,profile`,
  method: 'GET',
  headers: withGUIAuth(),
  types: [
    ACTUATOR_SELECT_REQUEST,
    {
      type: ACTUATOR_SELECT_SUCCESS,
      meta: {
        type
      }
    },
    ACTUATOR_SELECT_FAILURE
  ]
});

export interface ActuatorSelectAction extends ActionSuccessResult {
  type: typeof ACTUATOR_SELECT_SUCCESS;
  meta: {
    type: 'actuator' | 'profile'
  }
}

// GET - /api/device?fields=device_id.name - get base info of all devices
const DEVICE_INFO_REQUEST = '@@generate/DEVICE_INFO_REQUEST';
export const DEVICE_INFO_SUCCESS = '@@generate/DEVICE_INFO_SUCCESS';
export const DEVICE_INFO_FAILURE = '@@generate/DEVICE_INFO_FAILURE';
export const deviceInfo = (fields=['device_id', 'name', 'transport'], page=1, count=10) => createAction({
  endpoint: `/api/device?fields=${fields.join(',')}&page=${page}&length=${count}`,
  method: 'GET',
  headers: withGUIAuth(),
  types: [
    DEVICE_INFO_REQUEST,
    {
      type: DEVICE_INFO_SUCCESS,
      meta: {
        fields,
        page: count === 10 ? 1 : page+1,
        count
      }
    },
    DEVICE_INFO_FAILURE
  ]
});

export interface DeviceInfoAction extends ActionSuccessResult {
  type: typeof DEVICE_INFO_SUCCESS;
  meta: {
    fields: Array<string>;
    page: number;
    count: number;
  }
}

// Request Actions
export interface InfoRequestActions extends ActionRequestResult {
  type: typeof ACTUATOR_INFO_REQUEST | typeof ACTUATOR_SELECT_REQUEST | typeof DEVICE_INFO_REQUEST;
}

// Failure Actions
export interface InfoFailureActions extends ActionFailureResult {
  type: typeof ACTUATOR_INFO_FAILURE | typeof ACTUATOR_SELECT_FAILURE | typeof DEVICE_INFO_FAILURE;
}

export type GenerateActions = (
  InfoRequestActions | InfoFailureActions |
  // Success Actions
  SetSchemaAction | ActuatorInfoAction | ActuatorSelectAction | DeviceInfoAction
);
