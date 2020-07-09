import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import actuator from './actuator';
import account from './account';
import auth from './auth';
import command from './command';
// import conformance from './conformance';
import device from './device';
import generate from './generate';
import util from './util';

// Additional stores
// import socket from './socket';
import theme from '../components/utils/theme-switcher/theme-reducer';

export default history => combineReducers({
  'router': connectRouter(history), // MUST BE 'router'
  // Custom Reducers
  'Actuator': actuator,
  'Account': account,
  'Auth': auth,
  'Command': command,
  // 'Conformance': conformance,
  'Device': device,
  'Generate': generate,
  'Util': util,
  // Additional Reducers
  // 'Socket': socket,
  'theme': theme
});
