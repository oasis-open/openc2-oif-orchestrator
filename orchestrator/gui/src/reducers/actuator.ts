import * as actuator from '../actions/actuator';
import { checkSchema, mergeByProperty } from '../components/utils';

export interface ActuatorState {
  actuators: Array<actuator.Actuator>;
  sort: string;
  count: number;
  errors: Record<string, any>;
}

const initialState: ActuatorState = {
  actuators: [],
  sort: '',
  count: 0,
  errors: {}
};

export default (state=initialState, action: actuator.ActuatorActions) => {
  let newActs: Array<actuator.Actuator>;
  let actuators = [];

  switch (action.type) {
    case actuator.GET_ACTUATORS_SUCCESS:
      newActs = action.payload.results || [];
      actuators = action.meta.refresh ? newActs : mergeByProperty(state.actuators, newActs, 'actuator_id');

      return {
        ...state,
        count: action.payload.count || 0,
        actuators: actuators.map(act => ({ ...act, schema: checkSchema(act.schema || {})})),
        sort: action.meta.sort,
        errors: {
          ...state.errors,
          [actuator.GET_ACTUATORS_FAILURE]: {}
        }
      };

    case actuator.CREATE_ACTUATOR_SUCCESS:
      setTimeout(() => {
        action.asyncDispatch(actuator.getActuators({
          page: 1,
          count: state.actuators.length+1,
          sort: state.sort,
          refresh: true
        }));
      }, 500);

      return {
        ...state,
        errors: {
          ...state.errors,
          [actuator.CREATE_ACTUATOR_FAILURE]: {}
        }
      };

    case actuator.GET_ACTUATOR_SUCCESS:
      newActs = [action.payload] || [];
      actuators = mergeByProperty(state.actuators, newActs, 'actuator_id');

      return {
        ...state,
        actuators: actuators.map(act => ({ ...act, schema: checkSchema(act.schema || {})})),
        errors: {
          ...state.errors,
          [actuator.GET_ACTUATOR_FAILURE]: {}
        }
      };

    case actuator.UPDATE_ACTUATOR_SUCCESS:
      setTimeout(() => {
        action.asyncDispatch(actuator.getActuators({
          page: 1,
          count: state.actuators.length,
          sort: state.sort,
          refresh: true
        }));
      }, 500);

      return {
        ...state,
        errors: {
          ...state.errors,
          [actuator.UPDATE_ACTUATOR_FAILURE]: {}
        }
      };

    case actuator.DELETE_ACTUATOR_SUCCESS:
      setTimeout(() => {
        action.asyncDispatch(actuator.getActuators({
          page: 1,
          count: state.actuators.length,
          sort: state.sort,
          refresh: true
        }));
      }, 500);

      return {
        ...state,
        errors: {
          ...state.errors,
          [actuator.DELETE_ACTUATOR_FAILURE]: {}
        }
      };

    case actuator.GET_ACTUATORS_FAILURE:
    case actuator.CREATE_ACTUATOR_FAILURE:
    case actuator.GET_ACTUATOR_FAILURE:
    case actuator.UPDATE_ACTUATOR_FAILURE:
    case actuator.DELETE_ACTUATOR_FAILURE:
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
