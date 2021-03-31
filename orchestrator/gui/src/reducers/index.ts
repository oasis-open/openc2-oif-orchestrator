import { Reducer, combineReducers } from 'redux';
import { History } from 'history';
import { LocationChangeAction, RouterState, connectRouter } from 'connected-react-router';

import actuator, { ActuatorState } from './actuator';
import account, { AccountState } from './account';
import auth, { AuthState } from './auth';
import command, { CommandState } from './command';
import conformance, { ConformanceState } from './conformance';
import device, { DeviceState } from './device';
import generate, { GenerateState } from './generate';
import socket, { SocketState } from './socket';
import util, { UtilState } from './util';

export interface RootState {
  router: Reducer<RouterState<History>, LocationChangeAction<History>>; // MUST BE 'router'
  // Custom Reducers
  Account: AccountState;
  Actuator: ActuatorState,
  Auth: AuthState,
  Command: CommandState,
  Conformance: ConformanceState,
  Device: DeviceState,
  Generate: GenerateState,
  Socket: SocketState,
  Util: UtilState
}

export default (history: History) => combineReducers({
  router: connectRouter(history), // MUST BE 'router'
  // Custom Reducers
  Actuator: actuator,
  Account: account,
  Auth: auth,
  Command: command,
  Conformance: conformance,
  Device: device,
  Generate: generate,
  Socket: socket,
  Util: util
});
