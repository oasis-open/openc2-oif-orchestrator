import { RSAA } from 'redux-api-middleware';

const str_fmt = require('string-format')

import { withGUIAuth, withOrcAuth, withOrcURL } from './util'

// Helper Functions
// N/A - N/A - set schema locally
export const SCHEMA_DEFINE = '@@generate/SCHEMA_DEFINE';
export const SCHEMA_SUCCESS = '@@generate/SCHEMA_SUCCESS';
export const SCHEMA_FAILURE = '@@generate/SCHEMA_FAILURE';
export const setSchema = (schema) => ({
    [RSAA]: {
        endpoint: '',
        method: 'OPTIONS',
        types: [
            {
                type: SCHEMA_DEFINE,
                payload: (action, state) => ({ schema: schema })
            },
            SCHEMA_SUCCESS,
            SCHEMA_FAILURE
        ]
    }
})

// API Calls
// GET - /api/actuator?fields=actuator_id.name,profile,device - get base info of all actuators
const ACTUATOR_INFO_REQUEST = '@@generate/ACTUATOR_INFO_REQUEST'
export const ACTUATOR_INFO_SUCCESS = '@@generate/ACTUATOR_INFO_SUCCESS'
export const ACTUATOR_INFO_FAILURE = '@@generate/ACTUATOR_INFO_FAILURE'
export const actuatorInfo = (fields=['actuator_id', 'name', 'profile', 'device'], page=1, count=10) => ({
    [RSAA]: {
        endpoint: str_fmt('/api/actuator?fields={fields}&page={page}&length={count}', {fields: fields.join(','), page: page, count: count}),
        method: 'GET',
        headers: withGUIAuth({'Content-Type': 'application/json'}),
        types: [
            ACTUATOR_INFO_REQUEST,
            {
                type: ACTUATOR_INFO_SUCCESS,
                meta: {
                    fields,
                    page: count===10 ? 1 : ++page,
                    count
                }
            },
            ACTUATOR_INFO_FAILURE
        ]
    }
})

// GET - /api/actuator?fields=actuator_id.name,profile - get base info of all actuators
const ACTUATOR_SELECT_REQUEST = '@@generate/ACTUATOR_SELECT_REQUEST'
export const ACTUATOR_SELECT_SUCCESS = '@@generate/ACTUATOR_SELECT_SUCCESS'
export const ACTUATOR_SELECT_FAILURE = '@@generate/ACTUATOR_SELECT_FAILURE'
export const actuatorSelect = (actUUID, type='actuator') => ({
    [RSAA]: {
        endpoint: str_fmt('/api/actuator/{act}/?fields=schema,profile', {act: actUUID}),
        method: 'GET',
        headers: withGUIAuth({'Content-Type': 'application/json'}),
        types: [
            ACTUATOR_SELECT_REQUEST,
            {
                type: ACTUATOR_SELECT_SUCCESS,
                meta: {
                    type: type
                }
            },
            ACTUATOR_SELECT_FAILURE
        ]
    }
})

// GET - /api/device?fields=device_id.name - get base info of all devices
const DEVICE_INFO_REQUEST = '@@generate/DEVICE_INFO_REQUEST'
export const DEVICE_INFO_SUCCESS = '@@generate/DEVICE_INFO_SUCCESS'
export const DEVICE_INFO_FAILURE = '@@generate/DEVICE_INFO_FAILURE'
export const deviceInfo = (fields=['device_id', 'name'], page=1, count=10) => ({
    [RSAA]: {
        endpoint: str_fmt('/api/device?fields={fields}&page={page}&length={count}', {fields: fields.join(','), page: page, count: count}),
        method: 'GET',
        headers: withGUIAuth({'Content-Type': 'application/json'}),
        types: [
            DEVICE_INFO_REQUEST,
            {
                type: DEVICE_INFO_SUCCESS,
                meta: {
                    fields,
                    page: count===10 ? 1 : ++page,
                    count
                }
            },
           DEVICE_INFO_FAILURE
        ]
    }
})

