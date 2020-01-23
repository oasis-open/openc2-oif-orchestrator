import { WebSocketBridge } from 'django-channels'
import * as socket from '../actions/socket'

const initialState = {
  connected: false,
  connection: null,
  endpoint: 'ws://' + location.hostname + ':8080',
  queue: []
}

export default (state=initialState, action=null) => {
  switch(action.type) {
    case socket.SOCKET_SETUP:
      console.log("WebSocket Setup", action.payload)
      return {
        ...state,
        connection: action.payload.socket || state.socket,
        endpoint: action.payload.endpoint || state.endpoint,
        queue: action.payload.queue || state.queue
      }

    case socket.SOCKET_CONNECTED:
      console.log("WebSocket Connected")
      return {
        ...state,
        connected: action.payload.connected || true
      }

    case socket.SOCKET_DISCONNECTED:
      console.log("WebSocket Disconnected")
      return {
        ...state,
        connected: action.payload.connected || false
      }

    case socket.RECEIVED_SOCKET_DATA:
      console.log("WebSocket Data")
      try {
        let act = JSON.parse(action.payload.data)
        console.log(act)
        action.asyncDispatch(act)
      } catch(err) {
        console.log(err)
        action.asyncDispatch(socket.createErrorAction(state.endpoint, err))
      }
      return {
        ...state,
      }

    case socket.SOCKET_ERROR:
      console.log("WebSocket Error", action.payload)
      return {
        ...state,
        error: action.payload.error || ''
      }

    default:
      return state
  }
}
