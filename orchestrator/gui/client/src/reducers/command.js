import * as command from '../actions/command'

import {
    mergeByProperty
} from '../components/utils'

const initialState = {
    commands: [],
    sort: '',
    count: 0,
    errors: {}
}

export default (state=initialState, action=null) => {
    switch(action.type) {
        case command.GET_COMMANDS_SUCCESS:
            let newActs = action.payload.results || []

            return {
                ...state,
                count: action.payload.count || 0,
                commands: action.meta.refresh ? newActs : mergeByProperty(state.commands, newActs, 'command_id'),
                sort: action.meta.sort,
                errors: {
                    ...state.errors,
                    [command.GET_COMMANDS_FAILURE]: {}
                }
            }

        case command.SEND_COMMAND_SUCCESS:
            setTimeout(() => {
                action.asyncDispatch(command.getCommand(action.payload.command_id))
            }, action.payload.wait * 1000 || 1000)

            return {
                ...state,
                errors: {
                    ...state.errors,
                    [command.SEND_COMMAND_FAILURE]: {}
                }
            }

        case command.GET_COMMAND_SUCCESS:
            return {
                ...state,
                commands:mergeByProperty(state.commands, [action.payload], 'command_id')
            }

        case command.GET_COMMANDS_FAILURE:
        case command.SEND_COMMAND_FAILURE:
        case command.GET_COMMAND_FAILURE:
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
