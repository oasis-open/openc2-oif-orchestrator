import * as generate from '../actions/generate'

import {
    checkSchema,
    mergeByProperty
} from '../components/utils'

const initialState = {
    selected: {
        type: '',
        profile: '',
        schema: {}
    },
    actuators: [],
    devices: [],
    message: {},
    types: {
        schema: ['Record', 'Enumerated', 'Map', 'Choice', 'ArrayOf', 'Array'],
		base: ['String']
    }
}

export default (state=initialState, action=null) => {
    let tmpMsg = {...state.message} || {}
    let tmpState = {}

    switch(action.type) {
        case generate.SCHEMA_DEFINE:
            return {
                ...state,
                selectedSchema: checkSchema(action.payload.schema)
            }

        case generate.ACTUATOR_INFO_SUCCESS:
            let newActs = action.payload.results || []
            tmpState = {
                ...state,
                actuators: mergeByProperty(state.actuators, newActs, 'actuator_id')
            }

            if (action.payload.count > tmpState.actuators.length) {
                action.asyncDispatch(generate.actuatorInfo(action.meta.fields, action.meta.page, 100))
            }

            return tmpState

        case generate.DEVICE_INFO_SUCCESS:
            let newDevs = action.payload.results || []
            tmpState = {
                ...state,
                devices: mergeByProperty(state.devices, newDevs, 'device_id')
            }

            if (action.payload.count > tmpState.devices.length) {
                action.asyncDispatch(generate.deviceInfo(action.meta.fields, action.meta.page, 100))
            }

            return tmpState

        case generate.ACTUATOR_SELECT_SUCCESS:
            return {
                ...state,
                selected: {
                    type: action.meta.type,
                    schema: checkSchema(action.payload.schema),
                    profile: action.payload.profile
                }
             }

        case generate.SCHEMA_FAILURE:
        case generate.ACTUATOR_INFO_FAILURE:
        case generate.ACTUATOR_SELECT_FAILURE:
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
