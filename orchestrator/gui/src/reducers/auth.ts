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
  refresh_token: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: Record<string, any>;
}

export const tokenCookie = 'JWT';
const initialState: AuthState = {
  access: undefined,
  refresh: false,
  refresh_token: '',
  errors: {}
};

export default (state=initialState, action: Auth.AuthActions): AuthState => {
  let access: DecodedJWT;
  switch (action.type) {
    case Auth.LOGIN_SUCCESS:
      access = jwtDecode<DecodedJWT>(action.payload.access);
      Cookies.set(tokenCookie, action.payload.access, {
        expires: fromUnixTime(access.exp),
        sameSite: 'strict'
      });
      return {
        ...state,
        access: {
          token: action.payload.access,
          ...access
        },
        refresh_token: action.payload.refresh,
        errors: {}
      };

    case Auth.LOGOUT:
      Cookies.remove(tokenCookie);
      return {
        ...state,
        access: undefined,
        refresh_token: '',
        errors: {}
      };

    case Auth.TOKEN_REFRESH:
      return {
        ...state,
        refresh: true
      };

    case Auth.TOKEN_REFRESHED:
      access = jwtDecode<DecodedJWT>(action.payload.access);
      Cookies.set(tokenCookie, action.payload.access, {
        expires: fromUnixTime(access.exp),
        sameSite: 'strict'
      });
      return {
        ...state,
        access: {
          token: action.payload.access,
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
        refresh_token: '',
        errors: action.payload.response || {'non_field_errors': action.payload.statusText}
      };

    default:
      if (state.access) {
        const curr = new Date();
        const diff = differenceInMinutes(fromUnixTime(state.access.exp), curr);

        if (diff <= 5 && !state.refresh) {
        // eslint-disable-next-line promise/no-callback-in-promise
          action.asyncDispatch(Auth.refreshAccessToken(state.refresh_token));
          return {
            ...state,
            refresh: true
          };
        }
      }
      return state;
  }
};
