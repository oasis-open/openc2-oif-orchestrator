import * as util from '../actions/util'

import {
    titleCase
} from '../components/utils'

const initialState = {
    site_title: 'Orchestrator',
    name: 'Orchestrator',
    message: 'MESSAGE',
    id: '123456789',
    protocols: [],
    serializations: []
}

export default (state=initialState, action=null) => {
    switch(action.type) {
        case util.INFO_SUCCESS:
            return {
                site_title: titleCase(action.payload.name.toLowerCase() || 'Orchestrator'),
                name: titleCase(action.payload.name || 'Orchestrator'),
                message: action.payload.message || 'MESSAGE',
                id: action.payload.id || '123456789',
                protocols: action.payload.protocols || [],
                serializations: action.payload.serializations || []
            }

        case util.INFO_FAILURE:
            console.log('Failure', action.type, action)
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
