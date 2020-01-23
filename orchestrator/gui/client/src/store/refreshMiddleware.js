// Automatically refresh the authentication JWT before it expires
import { isRSAA } from 'redux-api-middleware'
import * as AuthActions from '../actions/auth'
import {
  differenceInMinutes,
  fromUnixTime,
  toDate
} from 'date-fns'

export default ({ getState }) => {
  return next => action => {
    if (isRSAA(action)) {
      let auth = getState().Auth

      if (auth.access) {
        let exp = fromUnixTime(auth.access.exp)
        let orig_iat = fromUnixTime(auth.access.orig_iat)
        let diff = differenceInMinutes(exp, orig_iat)

        if (differenceInMinutes(new Date(), orig_iat) > (diff-5) && !auth.refresh) {
          return next(AuthActions.refreshAccessToken(auth.access.token)).then(() => next(action))
        } else {
          return next(action)
        }
      }
    }
    return next(action)
  }
}