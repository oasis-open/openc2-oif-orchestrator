// Actions for device API
import { createAction } from 'redux-api-middleware';
import { ActionFailureResult, ActionRequestResult, ActionSuccessResult } from './interfaces';
import { withGUIAuth } from './util';

export interface Transport {
  transport_id?: string;
  host: string;
  port: number;
  protocol: string;
  serialization: Array<string>;
  [key: string]: any;
}

export interface Device {
  device_id: string;
  name: string;
  note: string;
  transport: Array<Transport>;
}

// API Base URL
const baseAPI = '/api/device';

// Helper Functions
// None

// API Calls
// GET - /api/device/ - all devices
const GET_DEVICES_REQUEST = '@@device/GET_DEVICES_REQUEST';
export const GET_DEVICES_SUCCESS = '@@device/GET_DEVICES_SUCCESS';
export const GET_DEVICES_FAILURE = '@@device/GET_DEVICES_FAILURE';
export const getDevices = ({
  page=1, count=10, sort='name', refresh=false
}={}) => createAction({
  endpoint: `${baseAPI}?page=${page}&length=${count}&ordering=${sort}`,
  method: 'GET',
  headers: withGUIAuth(),
  types: [
    GET_DEVICES_REQUEST,
    {
      type: GET_DEVICES_SUCCESS,
      meta: {
        sort,
        refresh
      }
    },
    GET_DEVICES_FAILURE
  ]
});

export interface GetDevicesAction extends ActionSuccessResult {
  type: typeof GET_DEVICES_SUCCESS;
  payload: {
    count: number;
    next: string;
    previous:string;
    results: Array<Device>;
  };
  meta: {
    sort: string;
    refresh: boolean;
  };
}

// POST - /api/device/ - create device (name, host, port, protocol, serialization, type)
const CREATE_DEVICE_REQUEST = '@@device/CREATE_DEVICE_REQUEST';
export const CREATE_DEVICE_SUCCESS = '@@device/CREATE_DEVICE_SUCCESS';
export const CREATE_DEVICE_FAILURE = '@@device/CREATE_DEVICE_FAILURE';
export const createDevice = (device: Device) => createAction({
  endpoint: `${baseAPI}/`,
  method: 'POST',
  headers: withGUIAuth(),
  body: JSON.stringify(device),
  types: [
    CREATE_DEVICE_REQUEST, CREATE_DEVICE_SUCCESS, CREATE_DEVICE_FAILURE
  ]
});

export interface CreateDeviceAction extends ActionSuccessResult {
  type: typeof CREATE_DEVICE_SUCCESS;
  payload: Device;
}

// GET - /api/device/{name}/ - specific device
const GET_DEVICE_REQUEST = '@@device/GET_DEVICE_REQUEST';
export const GET_DEVICE_SUCCESS = '@@device/GET_DEVICE_SUCCESS';
export const GET_DEVICE_FAILURE = '@@device/GET_DEVICE_FAILURE';
export const getDevice = (deviceUUID: string) => createAction({
  endpoint: `${baseAPI}/${deviceUUID}/`,
  method: 'GET',
  headers: withGUIAuth(),
  types: [
    GET_DEVICE_REQUEST, GET_DEVICE_SUCCESS, GET_DEVICE_FAILURE
  ]
});

export interface GetDeviceAction extends ActionSuccessResult {
  type: typeof GET_DEVICE_SUCCESS;
  payload: Device;
}

// PATCH - /api/device/{name}/ - update specified device
const UPDATE_DEVICE_REQUEST = '@@device/UPDATE_DEVICE_REQUEST';
export const UPDATE_DEVICE_SUCCESS = '@@device/UPDATE_DEVICE_SUCCESS';
export const UPDATE_DEVICE_FAILURE = '@@device/UPDATE_DEVICE_FAILURE';
export const updateDevice = (deviceUUID: string, device: Device) => createAction({
  endpoint: `${baseAPI}/${deviceUUID}/`,
  method: 'PATCH',
  headers: withGUIAuth(),
  body: JSON.stringify(device),
  types: [
    UPDATE_DEVICE_REQUEST, UPDATE_DEVICE_SUCCESS, UPDATE_DEVICE_FAILURE
  ]
});

export interface UpdateDeviceAction extends ActionSuccessResult {
  type: typeof UPDATE_DEVICE_SUCCESS;
  payload: Device;
}

// DELETE - /api/device/{name}/ - delete specific device
const DELETE_DEVICE_REQUEST = '@@device/DELETE_DEVICE_REQUEST';
export const DELETE_DEVICE_SUCCESS = '@@device/DELETE_DEVICE_SUCCESS';
export const DELETE_DEVICE_FAILURE = '@@device/DELETE_DEVICE_FAILURE';
export const deleteDevice = (deviceUUID: string) => createAction({
  endpoint: `${baseAPI}/${deviceUUID}/`,
  method: 'DELETE',
  headers: withGUIAuth(),
  types: [
    DELETE_DEVICE_REQUEST, DELETE_DEVICE_SUCCESS, DELETE_DEVICE_FAILURE
  ]
});

export interface DeleteDeviceAction extends ActionSuccessResult {
  type: typeof DELETE_DEVICE_SUCCESS;
}

// Request Actions
export interface DeviceRequestActions extends ActionRequestResult {
  type: (
    typeof GET_DEVICES_REQUEST | typeof CREATE_DEVICE_REQUEST | typeof GET_DEVICE_REQUEST | typeof UPDATE_DEVICE_REQUEST |
    typeof DELETE_DEVICE_REQUEST
  );
}

// Failure Actions
export interface DeviceFailureActions extends ActionFailureResult {
  type: (
    typeof GET_DEVICES_FAILURE | typeof CREATE_DEVICE_FAILURE | typeof GET_DEVICE_FAILURE | typeof UPDATE_DEVICE_FAILURE |
    typeof DELETE_DEVICE_FAILURE
  );
}

export type DeviceActions = (
  DeviceRequestActions | DeviceFailureActions |
  // Success Actions
  GetDevicesAction | CreateDeviceAction | GetDeviceAction | UpdateDeviceAction | DeleteDeviceAction
);
