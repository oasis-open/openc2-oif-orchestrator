// Automatically refresh the authentication JWT before it expires
import { Dispatch, Middleware, MiddlewareAPI } from 'redux';
import { isRSAA } from 'redux-api-middleware';
import { differenceInMinutes, fromUnixTime } from 'date-fns';
import { Auth, DispatchAction } from '../../actions';

type DispatchTyped = Dispatch<DispatchAction>

function RefreshMiddleware(api: MiddlewareAPI<DispatchTyped>): ReturnType<Middleware> {
  return (next: DispatchTyped) => (action: DispatchAction) => {
    if (isRSAA(action)) {
      const auth = api.getState().Auth;

      if (auth.access) {
        const exp = fromUnixTime(auth.access.exp);
        const origIat = fromUnixTime(auth.access.orig_iat);
        const diff = differenceInMinutes(exp, origIat);

        if (differenceInMinutes(new Date(), origIat) > (diff-5) && !auth.refresh) {
        // eslint-disable-next-line promise/no-callback-in-promise
          return next(Auth.refreshAccessToken(auth.access.token)).then(() => next(action));
        }
      }
    }
    // eslint-disable-next-line promise/no-callback-in-promise
    return next(action);
  };
}

export default RefreshMiddleware;