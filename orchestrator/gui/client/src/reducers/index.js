import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

import actuator from './actuator'
import account from './account'
import auth from './auth'
import command from './command'
import device from './device'
import generate from './generate'
// import socket from './socket'
import util from './util'

export default (history) => combineReducers({
  'router': connectRouter(history), // MUST BE 'router'
  // Custom Reducers
  'Actuator': actuator,
  'Account': account,
  'Auth': auth,
  'Command': command,
  'Device': device,
  'Generate': generate,
  // 'Socket': socket,
  'Util': util
})
