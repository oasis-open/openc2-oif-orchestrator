// Actions for client side generate page
import { RSAA } from 'redux-api-middleware';
import { withGUIAuth } from './util';

// Helper Functions
// N/A - N/A - set schema locally
const SCHEMA_DEFINE = '@@generate/SCHEMA_DEFINE';
export const SCHEMA_SUCCESS = '@@generate/SCHEMA_SUCCESS';
export const SCHEMA_FAILURE = '@@generate/SCHEMA_FAILURE';
export const setSchema = schema => ({
  [RSAA]: {
    endpoint: '',
    method: 'OPTIONS',
    types: [
      SCHEMA_DEFINE,
      {
        type: SCHEMA_SUCCESS,
        meta: {
          schema
        }
      },
      SCHEMA_FAILURE
    ]
  }
});

// API Calls
// GET - /api/actuator?fields=actuator_id,name,profile,device - get base info of all actuators
const ACTUATOR_INFO_REQUEST = '@@generate/ACTUATOR_INFO_REQUEST';
export const ACTUATOR_INFO_SUCCESS = '@@generate/ACTUATOR_INFO_SUCCESS';
export const ACTUATOR_INFO_FAILURE = '@@generate/ACTUATOR_INFO_FAILURE';
export const actuatorInfo = (fields=['actuator_id', 'name', 'profile', 'device'], page=1, count=10) => ({
  [RSAA]: {
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
  }
});

// GET - /api/actuator?fields=actuator_id,name,profile - get base info of all actuators
const ACTUATOR_SELECT_REQUEST = '@@generate/ACTUATOR_SELECT_REQUEST';
export const ACTUATOR_SELECT_SUCCESS = '@@generate/ACTUATOR_SELECT_SUCCESS';
export const ACTUATOR_SELECT_FAILURE = '@@generate/ACTUATOR_SELECT_FAILURE';
export const actuatorSelect = (actUUID, type='actuator') => ({
  [RSAA]: {
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
  }
});

// GET - /api/device?fields=device_id.name - get base info of all devices
const DEVICE_INFO_REQUEST = '@@generate/DEVICE_INFO_REQUEST';
export const DEVICE_INFO_SUCCESS = '@@generate/DEVICE_INFO_SUCCESS';
export const DEVICE_INFO_FAILURE = '@@generate/DEVICE_INFO_FAILURE';
export const deviceInfo = (fields=['device_id', 'name', 'transport'], page=1, count=10) => ({
  [RSAA]: {
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
  }
});
