// Actions for device API
import { RSAA } from 'redux-api-middleware'
import { withGUIAuth } from './util'

const str_fmt = require('string-format')

// API Base URL
const baseAPI = '/api/device'

// Helper Functions
// None

// API Calls
// GET - /api/device/ - all devices
const GET_DEVICES_REQUEST = '@@device/GET_DEVICES_REQUEST'
export const GET_DEVICES_SUCCESS = '@@device/GET_DEVICES_SUCCESS'
export const GET_DEVICES_FAILURE = '@@device/GET_DEVICES_FAILURE'
export const getDevices = ({page=1, count=10, sort='name', refresh=false}={}) => ({
  [RSAA]: {
    endpoint: str_fmt('{base}?page={page}&length={count}&ordering={sort}', {base: baseAPI, page: page, count: count, sort: sort}),
    method: 'GET',
    headers: withGUIAuth(),
    types: [
      GET_DEVICES_REQUEST,
      {
        type: GET_DEVICES_SUCCESS,
        meta: {
          sort: sort,
          refresh: refresh
        }
      },
      GET_DEVICES_FAILURE
    ]
  }
})

// POST - /api/device/ - create device (name, host, port, protocol, serialization, type)
const CREATE_DEVICE_REQUEST = '@@device/CREATE_DEVICE_REQUEST'
export const CREATE_DEVICE_SUCCESS = '@@device/CREATE_DEVICE_SUCCESS'
export const CREATE_DEVICE_FAILURE = '@@device/CREATE_DEVICE_FAILURE'
export const createDevice = (device) => ({
  [RSAA]: {
    endpoint: str_fmt('{base}/', {base: baseAPI}),
    method: 'POST',
    headers: withGUIAuth(),
    body: JSON.stringify(device),
    types: [
      CREATE_DEVICE_REQUEST, CREATE_DEVICE_SUCCESS, CREATE_DEVICE_FAILURE
    ]
  }
})

// GET - /api/device/{name}/ - specific device
const GET_DEVICE_REQUEST = '@@device/GET_DEVICE_REQUEST'
export const GET_DEVICE_SUCCESS = '@@device/GET_DEVICE_SUCCESS'
export const GET_DEVICE_FAILURE = '@@device/GET_DEVICE_FAILURE'
export const getDevice = (deviceUUID) => ({
  [RSAA]: {
    endpoint: str_fmt('{base}/{device}/', {base: baseAPI, device: deviceUUID}),
    method: 'GET',
    headers: withGUIAuth(),
    types: [
      GET_DEVICE_REQUEST, GET_DEVICE_SUCCESS, GET_DEVICE_FAILURE
    ]
  }
})

// PATCH - /api/device/{name}/ - update specified device
const UPDATE_DEVICE_REQUEST = '@@device/UPDATE_DEVICE_REQUEST'
export const UPDATE_DEVICE_SUCCESS = '@@device/UPDATE_DEVICE_SUCCESS'
export const UPDATE_DEVICE_FAILURE = '@@device/UPDATE_DEVICE_FAILURE'
export const updateDevice = (deviceUUID, device) => ({
  [RSAA]: {
    endpoint: str_fmt('{base}/{device}/', {base: baseAPI, device: deviceUUID}),
    method: 'PATCH',
    headers: withGUIAuth(),
    body: JSON.stringify(device),
    types: [
      UPDATE_DEVICE_REQUEST, UPDATE_DEVICE_SUCCESS, UPDATE_DEVICE_FAILURE
    ]
  }
})

// DELETE - /api/device/{name}/ - delete specific device
const DELETE_DEVICE_REQUEST = '@@device/DELETE_DEVICE_REQUEST'
export const DELETE_DEVICE_SUCCESS = '@@device/DELETE_DEVICE_SUCCESS'
export const DELETE_DEVICE_FAILURE = '@@device/DELETE_DEVICE_FAILURE'
export const deleteDevice = (deviceUUID) => ({
  [RSAA]: {
    endpoint: str_fmt('{base}/{device}/', {base: baseAPI, device: deviceUUID}),
    method: 'DELETE',
    headers: withGUIAuth(),
    types: [
      DELETE_DEVICE_REQUEST, DELETE_DEVICE_SUCCESS, DELETE_DEVICE_FAILURE
    ]
  }
})

// GET - /api/device/{name}/users/ - users with access to device
const GET_DEVICE_USERS_REQUEST = '@@device/GET_DEVICE_USERS_REQUEST'
export const GET_DEVICE_USERS_SUCCESS = '@@device/GET_DEVICE_USERS_SUCCESS'
export const GET_DEVICE_USERS_FAILURE = '@@device/GET_DEVICE_USERS_FAILURE'
export const getDeviceUsers = (deviceUUID) => ({
  [RSAA]: {
    endpoint: str_fmt('{base}/{device}/users', {base: baseAPI, device: deviceUUID}),
    method: 'GET',
    headers: withGUIAuth(),
    types: [
      GET_DEVICE_USERS_REQUEST, GET_DEVICE_USERS_SUCCESS, GET_DEVICE_USERS_FAILURE
    ]
  }
})
