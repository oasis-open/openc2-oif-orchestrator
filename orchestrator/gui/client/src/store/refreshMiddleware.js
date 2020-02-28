// Automatically refresh the authentication JWT before it expires
import { isRSAA } from 'redux-api-middleware';
import { differenceInMinutes, fromUnixTime } from 'date-fns';
import * as AuthActions from '../actions/auth';

export default ({ getState }) => {
  return next => action => {
    if (isRSAA(action)) {
      const auth = getState().Auth;

      if (auth.access) {
        const exp = fromUnixTime(auth.access.exp);
        const origIat = fromUnixTime(auth.access.orig_iat);
        const diff = differenceInMinutes(exp, origIat);

        if (differenceInMinutes(new Date(), origIat) > (diff-5) && !auth.refresh) {
          return next(AuthActions.refreshAccessToken(auth.access.token)).then(() => next(action));
        }
      }
    }
    return next(action);
  };
};