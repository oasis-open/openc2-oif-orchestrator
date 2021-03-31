import { WebSocketBridge } from 'django-channels';
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
  endpoint: `ws://${window.location.host}:8080`,
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

    case socket.SOCKET_DISCONNECTED:
      console.warn('WebSocket Disconnected');
      return {
        ...state,
        connected: action.payload.connected || false
      };

    case socket.RECEIVED_SOCKET_DATA:
      try {
        const act = JSON.parse(action.payload.data);
        action.asyncDispatch(act);
      } catch (err) {
        console.error(err);
        action.asyncDispatch(socket.createSocketError(state.endpoint, err));
      }
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
