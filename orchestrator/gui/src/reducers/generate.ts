import { Schema } from 'react-json-generator';
import { Actuator, Device, Generate } from '../actions';
import { checkSchema, mergeByProperty } from '../components/utils';

export interface GenerateState {
  selected: {
    type: string;
    profile: string;
    schema: Schema.JSONSchema;
  },
  actuators: Array<Actuator.Actuator>;
  devices: Array<Device.Device>;
  message: Record<string, any>;
  types: {
    schema: Array<string>;  // ['Record', 'Enumerated', 'Map', 'Choice', 'ArrayOf', 'Array'],
    base: Array<string>;  // ['String']
  };
  errors: Record<string, any>;
}

const initialState: GenerateState = {
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
  },
  errors: {}
};

export default (state=initialState, action: Generate.GenerateActions) => {
  const tmpState = { ...state };
  let newActs: Array<Actuator.Actuator>;
  let newDevs: Array<Device.Device>;

  switch (action.type) {
    case Generate.SCHEMA_DEFINE:
      return {
        ...state,
        selected: {
          ...state.selected,
          schema: checkSchema(action.meta.schema)
        }
      };

    case Generate.ACTUATOR_INFO_SUCCESS:
      newActs = action.payload.results || [];
      tmpState.actuators = mergeByProperty(state.actuators, newActs, 'actuator_id');

      if (action.payload.count > tmpState.actuators.length) {
        action.asyncDispatch(Generate.actuatorInfo(action.meta.fields, action.meta.page, 100));
      }
      return tmpState;

    case Generate.DEVICE_INFO_SUCCESS:
      newDevs = action.payload.results || [];
      tmpState.devices = mergeByProperty(state.devices, newDevs, 'device_id');

      if (action.payload.count > tmpState.devices.length) {
        action.asyncDispatch(Generate.deviceInfo(action.meta.fields, action.meta.page, 100));
      }
      return tmpState;

    case Generate.ACTUATOR_SELECT_SUCCESS:
      return {
        ...state,
        selected: {
          type: action.meta.type,
          schema: checkSchema(action.payload.schema),
          profile: action.payload.profile
        }
      };

    case Generate.ACTUATOR_INFO_FAILURE:
    case Generate.ACTUATOR_SELECT_FAILURE:
    case Generate.DEVICE_INFO_FAILURE:
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
