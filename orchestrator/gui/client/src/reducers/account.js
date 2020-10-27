import * as account from '../actions/account';

const initialState = {
  accounts: [],
  sort: '',
  count: 0,
  errors: {},
  status: {},
  refresh: false
};

export default (state=initialState, action=null) => {
  switch (action.type) {
    case account.CHANGE_ACCOUNT_PASSWORD_SUCCESS:
      return {
        ...state,
        status: {
          ...state.status,
          [account.CHANGE_ACCOUNT_PASSWORD_SUCCESS]: action.payload.status || {'non_field_status': action.payload.statusText}
        },
        errors: {
          ...state.errors,
          [account.CHANGE_ACCOUNT_PASSWORD_FAILURE]: {}
        }
      };

    case account.CHANGE_ACCOUNT_PASSWORD_FAILURE:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.type]: action.payload.response || {'non_field_errors': action.payload.statusText}
        }
      };

    default:
      return state;
  }
};
