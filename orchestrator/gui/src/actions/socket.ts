// Actions for WebSockets
import { Dispatch } from 'redux';
import { WebSocketBridge } from 'django-channels';
import { ErrorEvent, Options } from 'reconnecting-websocket';
import { ActionSuccessResult, BasicAction } from './interfaces';

// Socket Actions
export const SOCKET_SETUP = '@@socket/SOCKET_SETUP';
export const SOCKET_CONNECTED = '@@socket/SOCKET_CONNECTED';
export const SOCKET_DISCONNECTED = '@@socket/SOCKET_DISCONNECTED';
export const SOCKET_ERROR = '@@socket/SOCKET_ERROR';
export const RECEIVED_SOCKET_DATA = '@@socket/RECEIVED_SOCKET_DATA';

// TODO: replace with true actions
type Action = Record<string, any>;
const asyncDispatch = () => {};

// Helper Functions
export const isSocketAction = (action: Action) => {
  return Boolean(action && action.meta) && [
    SOCKET_SETUP,
    SOCKET_CONNECTED,
    SOCKET_DISCONNECTED,
    SOCKET_ERROR,
    RECEIVED_SOCKET_DATA
  ].includes(action.type);
};

export const undefinedEndpointErrorMessage = (action: Action) => {
  return `Whoops! You tried to dispatch an action to a socket instance that
  doesn't exist, as you didn't specify an endpoint in the action itself:
  ${JSON.stringify(action, null, 4)}
  Or you didn't set the 'defaultEndpoint' config option when creating your
  middleware instance.`;
};

// Socket Calls
// Socket Connected - WebSocket is connected and open
const createSocketConnection = (endpoint: string) => ({
  type: SOCKET_CONNECTED,
  payload: {
    connected: true
  },
  meta: {
    endpoint
  },
  asyncDispatch
});

export interface CreateSocketConnectionAction extends ActionSuccessResult {
  type: typeof SOCKET_CONNECTED;
  payload: {
    connected: true;
  };
  meta: {
    endpoint: string;
  };
}

// Socket Disconnected - WebSocket disconnected
const createSocketDisconnection = (endpoint: string) => ({
  type: SOCKET_DISCONNECTED,
  payload: {
    connected: false
  },
  meta: {
    endpoint
  },
  asyncDispatch
});

export interface CreateSocketDisconnectionAction extends ActionSuccessResult {
  type: typeof SOCKET_DISCONNECTED;
  payload: {
    connected: false;
  };
  meta: {
    endpoint: string;
  };
}

// Socket Error - WebSocket error has occurred
export const createSocketError = (endpoint: string, error: ErrorEvent) => ({
  type: SOCKET_ERROR,
  payload: {
    message: error.message
  },
  meta: {
    endpoint,
    error: true
  },
  asyncDispatch
});

export interface CreateSocketErrorAction extends BasicAction {
  type: typeof SOCKET_ERROR;
  payload: Error;
  meta: {
    endpoint: string;
    error: true;
  };
}

// Socket Message - WebSocket has received data, triggers appropriate store call
const onSocketMessage = (endpoint: string, data: MessageEvent) => {
  return {
    type: RECEIVED_SOCKET_DATA,
    payload: data,
    meta: {
      endpoint
    },
    asyncDispatch
  };
};

export interface OnSocketMessageAction extends ActionSuccessResult {
  type: typeof RECEIVED_SOCKET_DATA;
  payload: Record<string, any>;
  meta: {
    endpoint: string;
  };
}

// Setup Socket - opens connection and sets function calls for WebSocket events
const NULLS = [undefined, null, '', ' '];
export const setupSocket = (dispatch: Dispatch, endpoint?: string, protocols?: string|Array<string>, options?: Options) => {
  let endpointUpdate = `ws://${window.location.host}:8080`;
  if (endpoint) {
    endpointUpdate = !NULLS.includes(endpoint) ? `ws://${window.location.host}:8080` : endpoint;
  }
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
  socket.socket.onopen = () => dispatch(createSocketConnection(endpointUpdate));
  socket.socket.onclose = () => dispatch(createSocketDisconnection(endpointUpdate));
  socket.socket.onerror = (error: ErrorEvent) => dispatch(createSocketError(endpointUpdate, error));
  socket.socket.onmessage = (data: MessageEvent) => dispatch(onSocketMessage(endpointUpdate, data));

  return {
    type: SOCKET_SETUP,
    payload: {
      endpoint: endpointUpdate,
      socket,
      queue: []
    },
    asyncDispatch
  };
};

export interface SetupSocketAction extends ActionSuccessResult {
  type: typeof SOCKET_SETUP,
  payload: {
    endpoint: string;
    socket: WebSocketBridge;
    queue: Array<any>;
  };
}

export type SocketActions = (
  CreateSocketConnectionAction | CreateSocketDisconnectionAction | CreateSocketErrorAction |
  OnSocketMessageAction | SetupSocketAction
);
