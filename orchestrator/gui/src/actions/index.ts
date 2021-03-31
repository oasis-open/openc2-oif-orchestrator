import { LocationChangeAction } from 'connected-react-router';
import * as Account from './account';
import * as Actuator from './actuator';
import * as Auth from './auth';
import * as Command from './command';
import * as Conformance from './conformance';
import * as Device from './device';
import * as Generate from './generate';
import * as Interface from './interfaces';
import * as Socket from './socket';
import * as Util from './util';


export type DispatchAction = (
    // Pre API Call
    Interface.MinimalAction |
    // Post API Call
    Account.AccountActions | Actuator.ActuatorActions | Auth.AuthActions | Command.CommandActions |
    Conformance.ConformanceActions | Device.DeviceActions | Generate.GenerateActions | Socket.SocketActions |
    Util.UtilActions |
    // Socket Specific
    ReturnType<typeof Socket.setupSocket> |
    // Router Specific
    LocationChangeAction
);

export {
    // Interfaces
    Interface,
    // Actions
    Account,
    Actuator,
    Auth,
    Command,
    Conformance,
    Device,
    Generate,
    Socket,
    Util
};
