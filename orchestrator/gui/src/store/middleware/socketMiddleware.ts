// Translate a Redux API call to a WebSocket
import { Dispatch, Middleware, MiddlewareAPI } from 'redux';
import { RSAA, RSAACall, isRSAA } from 'redux-api-middleware';
import Cookies from 'js-cookie';
import { parse } from 'querystring';
import { DispatchAction, Interface, Socket } from '../../actions';
import { RootState } from '../../reducers';
import { tokenCookie } from '../../reducers/auth';
import { safeGet } from '../../components/utils';

type DispatchTyped = Dispatch<DispatchAction>
interface EndpointArgs {
  path_remaining: string;
  args: Record<string, string|number>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function streamEndpoint(endpoint: string): [string, EndpointArgs] {
  const paths = endpoint.split('/').filter(p => p && p !== 'api');
  let args = {};
  if (paths[paths.length - 1].includes('?')) {
    const [end, query] = paths[paths.length - 1].split('?', 2);
    paths[paths.length - 1] = end;
    args = parse(query);
  }
  return [
    paths[0].trim(),
    {
      path_remaining: paths.slice(1).join('/'),
      args
    }
  ];
}


function socketMiddleware(api: MiddlewareAPI<DispatchTyped, RootState>): ReturnType<Middleware> {
  setTimeout(() => api.dispatch(Socket.setupSocket(api.dispatch)), 50);
  return (next: DispatchTyped) => (action: DispatchAction) => {
    if (isRSAA(action)) {
      const state = api.getState();
      const auth = state.Auth;
      const socket = state.Socket;
      if (socket.connected && socket.connection) { // socket open & not api force
        const callAPI = safeGet<RSAACall>(action as Record<string, any>, RSAA);
        if (callAPI) {
          const [stream, args] = streamEndpoint(callAPI.endpoint as string);
          const payload: Record<string, any> = {
            endpoint: callAPI.endpoint,
            args,
            method: callAPI.method,
            data: JSON.parse(callAPI.body as string || '{}'),
            types: {
              success: callAPI.types[1],
              failure: callAPI.types[2]
            }
          };
          if (!Cookies.get(tokenCookie)) {
            payload.jwt = auth.access ? auth.access.token : '';
          }
          // console.log(stream || 'app', payload);
          // socket.connection.stream(stream || 'app').send(payload);
          socket.connection.stream('app').send(payload);

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
