import jwtDecode from 'jwt-decode'
import * as account from '../actions/account'

const initialState = {
    errors: {},
    status: {},
    refresh: false
}

export default (state=initialState, action=null) => {
    switch(action.type) {
        case account.CHANGE_USER_PASSWORD_SUCCESS:
            console.log('Success', action.type, action.payload)
            return {
                ...state,
                status: {
                    ...state.status,
                    [account.CHANGE_USER_PASSWORD_SUCCESS]: action.payload.status || {'non_field_status': action.payload.statusText},
                },
                errors: {
                    ...state.errors,
                    [account.CHANGE_USER_PASSWORD_FAILURE]: {}
                }
            }

        case account.CHANGE_USER_PASSWORD_FAILURE:
            console.log('Failure', action.type, action.payload)
            return {
                ...state,
                errors: {
                    ...state.errors,
                    [action.type]: action.payload.response || {'non_field_errors': action.payload.statusText},
                }
            }

        default:
            return state
    }
}
