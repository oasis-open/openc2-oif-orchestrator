import jwtDecode from 'jwt-decode'
import * as account from '../actions/account'

import {
    mergeByProperty
} from '../components/utils'

const initialState = {
    accounts: [],
    sort: '',
    count: 0,
    errors: {},
    status: {},
    refresh: false
}

export default (state=initialState, action=null) => {
    switch(action.type) {
        case account.GET_ACCOUNTS_SUCCESS:
            let newUsrs = action.payload.results || []
            let accounts = action.meta.refresh ? newUsrs : mergeByProperty(state.accounts, newUsrs, 'username')

            return {
                ...state,
                count: action.payload.count || 0,
                accounts: accounts,
                sort: action.meta.sort,
                errors: {
                    ...state.errors,
                    [account.GET_ACCOUNTS_FAILURE]: {}
                }
            }

        case account.CREATE_ACCOUNT_SUCCESS:
            setTimeout(() => {
                action.asyncDispatch(account.getAccounts({page: 1, count: state.accounts.length+1, sort: state.sort, refresh: true}))
            }, 500)

            return {
                ...state,
                errors: {
                    ...state.errors,
                    [account.CREATE_ACCOUNT_FAILURE]: {}
                }
            }

        case account.UPDATE_ACCOUNT_SUCCESS:
            setTimeout(() => {
                action.asyncDispatch(account.getAccounts({page: 1, count: state.accounts.length, sort: state.sort, refresh: true}))
            }, 500)

            return {
                ...state,
                errors: {
                    ...state.errors,
                    [account.UPDATE_ACCOUNT_FAILURE]: {}
                }
            }

        case account.DELETE_ACCOUNT_SUCCESS:
            setTimeout(() => {
                action.asyncDispatch(account.getAccounts({page: 1, count: state.accounts.length, sort: state.sort, refresh: true}))
            }, 500)

            return {
                ...state,
                errors: {
                    ...state.errors,
                    [account.DELETE_ACCOUNT_FAILURE]: {}
                }
            }


        case account.CHANGE_ACCOUNT_PASSWORD_SUCCESS:
            return {
                ...state,
                status: {
                    ...state.status,
                    [account.CHANGE_ACCOUNT_PASSWORD_SUCCESS]: action.payload.status || {'non_field_status': action.payload.statusText},
                },
                errors: {
                    ...state.errors,
                    [account.CHANGE_ACCOUNT_PASSWORD_FAILURE]: {}
                }
            }

        case account.GET_ACCOUNTS_FAILURE:
        case account.CREATE_ACCOUNT_FAILURE:
        case account.UPDATE_ACCOUNT_FAILURE:
        case account.DELETE_ACCOUNT_FAILURE:
        case account.CHANGE_ACCOUNT_PASSWORD_FAILURE:
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
