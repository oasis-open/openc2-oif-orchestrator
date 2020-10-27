import * as socket from '../actions/socket';

const initialState = {
  connected: false,
  connection: null,
  // eslint-disable-next-line no-restricted-globals
  endpoint: `ws://${location.host}:8080`,
  queue: []
};

export default (state=initialState, action=null) => {
  switch (action.type) {
    case socket.SOCKET_SETUP:
      return {
        ...state,
        connection: action.payload.socket || state.socket,
        endpoint: action.payload.endpoint || state.endpoint,
        queue: action.payload.queue || state.queue
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
        action.asyncDispatch(socket.createErrorAction(state.endpoint, err));
      }
      return state;

    case socket.SOCKET_ERROR:
      console.error('WebSocket Error', action.payload);
      return {
        ...state,
        error: action.payload.error || ''
      };

    default:
      return state;
  }
};
