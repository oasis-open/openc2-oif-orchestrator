/*
Translate a Redux API call to a WebSocket
*/
import { isRSAA, RSAA } from 'redux-api-middleware'

import * as SocketActions from '../actions/socket'

const NO_CONNECTION = null


export default ({getState, dispatch}) => {
    setTimeout(() => dispatch(SocketActions.setupSocket(dispatch)), 100)

    return next => action => {
        let auth = getState().Auth
        let socket = getState().Socket

        if (isRSAA(action)) {
            if (socket.connected && true) { // socket open & not api force
                const callAPI = action[RSAA];
                let message = {
                    endpoint: callAPI.endpoint,
                    method: callAPI.method,
                    jwt: auth.access ? auth.access.token : '',
                    data: JSON.parse(callAPI.body || '{}'),
                    types: {
                        success: callAPI.types[1],
                        failure: callAPI.types[2]
                    }
                }
                // console.log(callAPI, message)
                socket.connection.send(message)

                return next({
                    type: callAPI.types[0],
                    asyncDispatch: callAPI.asyncDispatch
                })
            } else if (true) { // TODO: Force api over socket??
                return next(action)
            }
        }
        if (action.hasOwnProperty('type')) {
            return next(action)
        }
    }
}