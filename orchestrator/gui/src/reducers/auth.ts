import jwtDecode from 'jwt-decode';
import * as auth from '../actions/auth';

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

const initialState: AuthState = {
  access: undefined,
  refresh: false,
  errors: {}
};

export default (state=initialState, action: auth.AuthActions): AuthState => {
  switch (action.type) {
    case auth.LOGIN_SUCCESS:
      return {
        ...state,
        access: {
          token: action.payload.token,
          ...jwtDecode<DecodedJWT>(action.payload.token)
        },
        errors: {}
      };

    case auth.LOGOUT:
      return {
        ...state,
        access: undefined,
        errors: {}
      };

    case auth.TOKEN_REFRESH:
      return {
        ...state,
        refresh: true
      };

    case auth.TOKEN_REFRESHED:
      return {
        ...state,
        access: {
          token: action.payload.token,
          ...jwtDecode<DecodedJWT>(action.payload.token)
        },
        errors: {},
        refresh: false
      };

    case auth.LOGIN_FAILURE:
    case auth.TOKEN_FAILURE:
      return {
        ...state,
        access: undefined,
        errors: action.payload.response || {'non_field_errors': action.payload.statusText}
      };

    default:
      return state;
  }
};
