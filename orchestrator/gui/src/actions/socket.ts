// Actions for WebSockets
import { Dispatch } from 'redux';
import { WebSocketBridge } from 'django-channels';
import { CloseEvent, ErrorEvent, Options } from 'reconnecting-websocket';
import { ActionSuccessResult, BasicAction } from './interfaces';

// Socket Actions
export const SOCKET_SETUP = '@@socket/SOCKET_SETUP';
export const SOCKET_CONNECTED = '@@socket/SOCKET_CONNECTED';
export const SOCKET_RECONNECT = '@@socket/SOCKET_RECONNECT';
export const SOCKET_DISCONNECTED = '@@socket/SOCKET_DISCONNECTED';
export const SOCKET_ERROR = '@@socket/SOCKET_ERROR';
export const SOCKET_MESSAGE = '@@socket/SOCKET_MESSAGE';

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
    SOCKET_MESSAGE
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
const createSocketConnection = () => ({
  type: SOCKET_CONNECTED,
  payload: {
    connected: true
  },
  asyncDispatch
});

export interface CreateSocketConnectionAction extends ActionSuccessResult {
  type: typeof SOCKET_CONNECTED;
  payload: {
    connected: true;
  };
}

// Socket Disconnected - WebSocket disconnected
export const createSocketReconnect = () => ({
  type: SOCKET_RECONNECT,
  payload: {
    connected: false
  },
  asyncDispatch
});

export interface CreateSocketReconnectAction extends ActionSuccessResult {
  type: typeof SOCKET_RECONNECT;
  payload: {
    connected: false;
  };
}

// Socket Disconnected - WebSocket disconnected
const createSocketDisconnection = (event: CloseEvent) => ({
  type: SOCKET_DISCONNECTED,
  payload: {
    connected: false,
    code: event.code
  },
  asyncDispatch
});

export interface CreateSocketDisconnectionAction extends ActionSuccessResult {
  type: typeof SOCKET_DISCONNECTED;
  payload: {
    connected: false;
    code: number;
  };
}

// Socket Error - WebSocket error has occurred
export const createSocketError = (event: ErrorEvent) => ({
  type: SOCKET_ERROR,
  payload: {
    message: event.message
  },
  meta: {
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
const onSocketMessage = (data: MessageEvent) => {
  const { stream, payload } = JSON.parse(data.data);
  return {
    type: SOCKET_MESSAGE,
    payload,
    meta: {
      stream
    },
    asyncDispatch
  };
};

export interface OnSocketMessageAction extends ActionSuccessResult {
  type: typeof SOCKET_MESSAGE;
  payload: Record<string, any>;
}

// Setup Socket - opens connection and sets function calls for WebSocket events
const NULLS = [undefined, null, '', ' '];
export const setupSocket = (dispatch: Dispatch, endpoint?: string, protocols?: string|Array<string>, options?: Options) => {
  let endpointUpdate = `ws://${window.location.host}/ws`;
  if (endpoint) {
    endpointUpdate = !NULLS.includes(endpoint) ? `ws://${window.location.host}/ws` : endpoint;
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
  socket.socket.onopen = () => dispatch(createSocketConnection());
  socket.socket.onclose = (event: CloseEvent) => dispatch(createSocketDisconnection(event));
  socket.socket.onerror = (event: ErrorEvent) => dispatch(createSocketError(event));
  socket.socket.onmessage = (data: MessageEvent) => dispatch(onSocketMessage(data));

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
  CreateSocketConnectionAction | CreateSocketReconnectAction | CreateSocketDisconnectionAction |
  CreateSocketErrorAction | OnSocketMessageAction | SetupSocketAction
);
