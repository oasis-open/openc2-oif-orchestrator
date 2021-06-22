import jwtDecode from 'jwt-decode';
import Cookies from 'js-cookie';
import { differenceInMinutes, fromUnixTime } from 'date-fns';
import { Auth } from '../actions';

interface DecodedJWT {
  admin: boolean;
  email: string;
  exp: number;
  orig_iat: number;
  username: string;
}

export interface AuthState {
  access?: DecodedJWT & {
    token: string;
  };
  refresh: boolean;
  errors: Record<string, any>;
}

export const tokenCookie = 'JWT';
const initialState: AuthState = {
  access: undefined,
  refresh: false,
  errors: {}
};

export default (state=initialState, action: Auth.AuthActions): AuthState => {
  let access: DecodedJWT;
  switch (action.type) {
    case Auth.LOGIN_SUCCESS:
      access = jwtDecode<DecodedJWT>(action.payload.token);
      Cookies.set(tokenCookie, action.payload.token, {
        expires: fromUnixTime(access.exp),
        sameSite: 'strict'
      });
      return {
        ...state,
        access: {
          token: action.payload.token,
          ...access
        },
        errors: {}
      };

    case Auth.LOGOUT:
      Cookies.remove(tokenCookie);
      return {
        ...state,
        access: undefined,
        errors: {}
      };

    case Auth.TOKEN_REFRESH:
      return {
        ...state,
        refresh: true
      };

    case Auth.TOKEN_REFRESHED:
      access = jwtDecode<DecodedJWT>(action.payload.token);
      Cookies.set(tokenCookie, action.payload.token, {
        expires: fromUnixTime(access.exp),
        sameSite: 'strict'
      });
      return {
        ...state,
        access: {
          token: action.payload.token,
          ...access
        },
        errors: {},
        refresh: false
      };

    case Auth.LOGIN_FAILURE:
    case Auth.TOKEN_FAILURE:
      Cookies.remove(tokenCookie);
      return {
        ...state,
        access: undefined,
        errors: action.payload.response || {'non_field_errors': action.payload.statusText}
      };

    default:
      if (state.access) {
        const origIat = fromUnixTime(state.access.orig_iat);
        const diff = differenceInMinutes(fromUnixTime(state.access.exp), origIat);

        if (differenceInMinutes(new Date(), origIat) > (diff-5) && !state.refresh) {
        // eslint-disable-next-line promise/no-callback-in-promise
          action.asyncDispatch(Auth.refreshAccessToken(state.access.token));
          return {
            ...state,
            refresh: true
          };
        }
      }
      return state;
  }
};
