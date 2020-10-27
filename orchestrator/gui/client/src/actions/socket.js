// Actions for WebSockets
import { WebSocketBridge } from 'django-channels';

// Socket Actions
export const SOCKET_SETUP = '@@socket/SOCKET_SETUP';
export const SOCKET_CONNECTED = '@@socket/SOCKET_CONNECTED';
export const SOCKET_DISCONNECTED = '@@socket/SOCKET_DISCONNECTED';
export const SOCKET_ERROR = '@@socket/SOCKET_ERROR';
export const RECEIVED_SOCKET_DATA = '@@socket/RECEIVED_SOCKET_DATA';

// Helper Functions
export const isSocketAction = action => {
  return Boolean(action && action.meta) && [
    SOCKET_SETUP,
    SOCKET_CONNECTED,
    SOCKET_DISCONNECTED,
    SOCKET_ERROR,
    RECEIVED_SOCKET_DATA
  ].includes(action.type);
};

export const undefinedEndpointErrorMessage = action => {
  return `Whoops! You tried to dispatch an action to a socket instance that
  doesn't exist, as you didn't specify an endpoint in the action itself:
  ${JSON.stringify(action, null, 4)}
  Or you didn't set the 'defaultEndpoint' config option when creating your
  middleware instance.`;
};

// Socket Calls
// Socket Connected - WebSocket is connected and open
const createConnectionAction = endpoint => ({
  type: SOCKET_CONNECTED,
  payload: {
    connected: true
  },
  meta: {
    endpoint
  }
});

// Socket Disconnected - WebSocket disconnected
const createDisconnectionAction = endpoint => ({
  type: SOCKET_DISCONNECTED,
  payload: {
    connected: false
  },
  meta: {
    endpoint
  }
});

// Socket Error - WebSocket error has occurred
export const createErrorAction = (endpoint, error) => ({
  type: SOCKET_ERROR,
  payload: new Error(error),
  meta: {
    endpoint,
    error: true
  }
});

// Socket Message - WebSocket has received data, triggers appropriate store call
const createMessageAction = (endpoint, data) => ({
  type: RECEIVED_SOCKET_DATA,
  payload: data,
  meta: {
    endpoint
  }
});

// Setup Socket - opens connection and sets function calls for WebSocket events
const NULLS = [null, '', ' '];
export const setupSocket = (dispatch, endpoint, protocols, options) => {
  // eslint-disable-next-line no-restricted-globals
  const endpointUpdate = !NULLS.includes(endpoint) ? `ws://${location.host}:8080` : endpoint;
  const socket = new WebSocketBridge();
  const optionsUpdate = {
    maxReconnectionDelay: 10000,
    minReconnectionDelay: 1500,
    reconnectionDelayGrowFactor: 1.3,
    connectionTimeout: 1000,
    maxRetries: 10,
    debug: false,
    ...options
  };
  socket.connect(endpointUpdate, protocols, optionsUpdate);
  socket.socket.onopen = () => dispatch(createConnectionAction(endpointUpdate));
  socket.socket.onclose = () => dispatch(createDisconnectionAction(endpointUpdate));
  socket.socket.onerror = error => dispatch(createErrorAction(endpointUpdate, error));
  socket.socket.onmessage = data => dispatch(createMessageAction(endpointUpdate, data));

  return {
    type: SOCKET_SETUP,
    payload: {
      endpoint: endpointUpdate,
      socket,
      queue: []
    },
    meta: {}
  };
};
