import { WebSocketBridge } from 'django-channels';
import { BasicAction } from '../actions/interfaces';
import * as socket from '../actions/socket';

export interface SocketState {
  connected: boolean
  connection?: WebSocketBridge;
  endpoint: string;
  error?: Error;
}

const initialState: SocketState = {
  connected: false,
  connection: undefined,
  endpoint: `ws://${window.location.host}/ws`,
  error: undefined
};

export default (state=initialState, action: socket.SocketActions) => {
  switch (action.type) {
    case socket.SOCKET_SETUP:
      return {
        ...state,
        connection: action.payload.socket || state.connection,
        endpoint: action.payload.endpoint || state.endpoint
      };

    case socket.SOCKET_CONNECTED:
      return {
        ...state,
        connected: action.payload.connected || true
      };

    case socket.SOCKET_RECONNECT:
      state.connection?.socket.reconnect();
      return {
        ...state,
        connected: action.payload.connected || false
      };

    case socket.SOCKET_DISCONNECTED:
      console.warn('WebSocket Disconnected');
      return {
        ...state,
        connected: action.payload.connected || false
      };

    case socket.SOCKET_MESSAGE:
      console.log('WebSocket Message', action.payload);
      action.asyncDispatch(action.payload as BasicAction);
      return state;

    case socket.SOCKET_ERROR:
      console.error('WebSocket Error', action.payload);
      return {
        ...state,
        error: action.payload || undefined
      };

    default:
      return state;
  }
};
