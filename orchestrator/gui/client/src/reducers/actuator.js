import * as actuator from '../actions/actuator'

import {
    checkSchema,
    mergeByProperty
} from '../components/utils'

const initialState = {
    actuators: [],
    sort: '',
    count: 0,
    errors: {}
}

export default (state=initialState, action=null) => {
    let actuators = []

    switch(action.type) {
        case actuator.GET_ACTUATORS_SUCCESS:
            let newActs = action.payload.results || []
            actuators = action.meta.refresh ? newActs : mergeByProperty(state.actuators, newActs, 'actuator_id')

            return {
                ...state,
                count: action.payload.count || 0,
                actuators: actuators.map((act, i) => ({ ...act, schema: checkSchema(act.schema || {})})),
                sort: action.meta.sort,
                errors: {
                    ...state.errors,
                    [actuator.GET_ACTUATORS_FAILURE]: {}
                }
            }

        case actuator.CREATE_ACTUATOR_SUCCESS:
            setTimeout(() => {
                action.asyncDispatch(actuator.getActuators({page: 1, count: state.actuators.length+1, sort: state.sort, refresh: true}))
            }, 500)

            return {
                ...state,
                errors: {
                    ...state.errors,
                    [actuator.CREATE_ACTUATOR_FAILURE]: {}
                }
            }

        case actuator.GET_ACTUATOR_SUCCESS:
            let newAct = [action.payload] || []
            actuators = action.meta.refresh ? newActs : mergeByProperty(state.actuators, newActs, 'actuator_id')

            return {
                count: action.payload.count || 1,
                actuators: actuators.map((act, i) => ({ ...act, schema: checkSchema(act.schema || {})})),
                ...state,
                errors: {
                    ...state.errors,
                    [actuator.GET_ACTUATOR_FAILURE]: {}
                }
            }

        case actuator.UPDATE_ACTUATOR_SUCCESS:
            setTimeout(() => {
                action.asyncDispatch(actuator.getActuators({page: 1, count: state.actuators.length, sort: state.sort, refresh: true}))
            }, 500)

            return {
                ...state,
                errors: {
                    ...state.errors,
                    [actuator.UPDATE_ACTUATOR_FAILURE]: {}
                }
            }

        case actuator.DELETE_ACTUATOR_SUCCESS:
            setTimeout(() => {
                action.asyncDispatch(actuator.getActuators({page: 1, count: state.actuators.length, sort: state.sort, refresh: true}))
            }, 500)

            return {
                ...state,
                errors: {
                    ...state.errors,
                    [actuator.DELETE_ACTUATOR_FAILURE]: {}
                }
            }

        case actuator.GET_ACTUATORS_FAILURE:
        case actuator.CREATE_ACTUATOR_FAILURE:
        case actuator.GET_ACTUATOR_FAILURE:
        case actuator.UPDATE_ACTUATOR_FAILURE:
        case actuator.DELETE_ACTUATOR_FAILURE:
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
