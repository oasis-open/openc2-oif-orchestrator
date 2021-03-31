// Translate a Redux API call to a WebSocket
import { Dispatch, Middleware, MiddlewareAPI } from 'redux';
import { RSAA, RSAACall, isRSAA } from 'redux-api-middleware';
import { DispatchAction, Interface, Socket } from '../../actions';
import { RootState } from '../../reducers';
import { safeGet } from '../../components/utils';

type DispatchTyped = Dispatch<DispatchAction>

function socketMiddleware(api: MiddlewareAPI<DispatchTyped, RootState>): ReturnType<Middleware> {
  setTimeout(() => api.dispatch(Socket.setupSocket(api.dispatch)), 100);
  return (next: DispatchTyped) => (action: DispatchAction) => {
    const state = api.getState();
    const auth = state.Auth;
    const socket = state.Socket;

    if (isRSAA(action)) {
      if (socket.connected && socket.connection) { // socket open & not api force
        const callAPI = safeGet<RSAACall>(action as Record<string, any>, RSAA);
        if (callAPI) {
          const message = {
            endpoint: callAPI.endpoint,
            method: callAPI.method,
            jwt: auth.access ? auth.access.token : '',
            data: JSON.parse(callAPI.body as string || '{}'),
            types: {
              success: callAPI.types[1],
              failure: callAPI.types[2]
            }
          };
          // console.log(callAPI, message);
          socket.connection.send(message);

          return next({
            type: callAPI.types[0],
            asyncDispatch: action.asyncDispatch
          } as Interface.MinimalAction);
        }
      } /* else if (true) { // TODO: Force api over socket??
        return next(action);
      } */
    }
    return next(action);
  };
}

export default socketMiddleware;