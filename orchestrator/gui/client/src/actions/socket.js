// Actions for WebSockets
import { WebSocketBridge } from 'django-channels'

const str_fmt = require('string-format')

// Helper Functions
export const isSocketAction = (action) => {
  return Boolean(action && action.meta) && [
    SOCKET_SETUP,
    SOCKET_CONNECTED,
    SOCKET_DISCONNECTED,
    SOCKET_ERROR,
    RECEIVED_SOCKET_DATA
  ].indexOf(action.type) > -1
}

export const undefinedEndpointErrorMessage = (action) => {
  return `Whoops! You tried to dispatch an action to a socket instance that
  doesn't exist, as you didn't specify an endpoint in the action itself:
  ${JSON.stringify(action, null, 4)}
  Or you didn't set the 'defaultEndpoint' config option when creating your
  middleware instance.`
}

// Socket Calls
// Setup Socket - opens connection and sets function calls for WebSocket events
export const SOCKET_SETUP = '@@socket/SOCKET_SETUP'
const NULLS = [null, '', ' ']
export const setupSocket = (dispatch, endpoint, protocols, options) => {
  endpoint = NULLS.indexOf(endpoint) === -1 ? 'ws://' + location.hostname + ':8080' : endpoint
  let connection = {
    endpoint: endpoint,
    socket: new WebSocketBridge(),
    queue: []
  }
  options = {
    maxReconnectionDelay: 10000,
    minReconnectionDelay: 1500,
    reconnectionDelayGrowFactor: 1.3,
    connectionTimeout: 1000,
    maxRetries: 10,
    debug: false,
    ...options
  }
  connection.socket.connect(endpoint, protocols, options)
  connection.socket.socket.onopen = () => dispatch(createConnectionAction(endpoint))
  connection.socket.socket.onclose = () => dispatch(createDisconnectionAction(endpoint))
  connection.socket.socket.onerror = error => dispatch(createErrorAction(endpoint, error))
  connection.socket.socket.onmessage = data => dispatch(createMessageAction(endpoint, data))

  return {
    type: SOCKET_SETUP,
    payload: connection,
    meta: {}
  }
}

// Socket Connected - WebSocket is connected and open
export const SOCKET_CONNECTED = '@@socket/SOCKET_CONNECTED'
const createConnectionAction = (endpoint) => ({
  type: SOCKET_CONNECTED,
  payload: {
    connected: true
  },
  meta: {
    endpoint: endpoint
  }
})

// Socket Disconnected - WebSocket disconnected
export const SOCKET_DISCONNECTED = '@@socket/SOCKET_DISCONNECTED'
const createDisconnectionAction = (endpoint) => ({
  type: SOCKET_DISCONNECTED,
  payload: {
    connected: false
  },
  meta: {
    endpoint: endpoint
  }
})

// Socket Error - WebSocket error has occurred
export const SOCKET_ERROR = '@@socket/SOCKET_ERROR'
export const createErrorAction = (endpoint, error) => ({
  type: SOCKET_ERROR,
  payload: new Error(error),
  meta: {
    endpoint: endpoint,
    error: true
  }
})

// Socket Message - WebSocket has received data, triggers appropriate store call
export const RECEIVED_SOCKET_DATA = '@@socket/RECEIVED_SOCKET_DATA'
const createMessageAction = (endpoint, data) => ({
  type: RECEIVED_SOCKET_DATA,
  payload: data,
  meta: {
    endpoint: endpoint
  }
})