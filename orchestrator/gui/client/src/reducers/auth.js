import jwtDecode from 'jwt-decode'
import * as auth from '../actions/auth'

const initialState = {
    access: undefined,
    errors: {},
    refresh: false
}

export default (state=initialState, action=null) => {
    switch(action.type) {
        case auth.LOGIN_SUCCESS:
            return {
                ...state,
                access: {
                    token: action.payload.token,
                    ...jwtDecode(action.payload.token)
                },
                errors: {}
            }

        case auth.LOGOUT_REQUEST:
        case auth.LOGOUT_SUCCESS:
            return {
                access: undefined,
                errors: {}
            }

        case auth.TOKEN_REFRESH:
            console.log('Token Refresh')
            return {
                ...state,
                refresh: true
            }

        case auth.TOKEN_REFRESHED:
            console.log('Token Refreshed')
            return {
                ...state,
                access: {
                    token: action.payload.token,
                    ...jwtDecode(action.payload.token)
                },
                errors: {},
                refresh: false
            }

        case auth.TOKEN_VALIDATED:
            return {
                ...state,
                access: {
                    token: action.payload.token,
                    ...jwtDecode(action.payload.token)
                },
                errors: {}
            }

        case auth.LOGIN_FAILURE:
        case auth.LOGOUT_FAILURE:
        case auth.TOKEN_FAILURE:
            console.log('Failure', action.type, action.payload)
            return {
                access: undefined,
                errors: action.payload.response || {'non_field_errors': action.payload.statusText},
            }

        default:
            return state
    }
}
