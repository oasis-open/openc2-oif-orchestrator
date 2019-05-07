import { isRSAA } from 'redux-api-middleware'

import * as AuthActions from '../actions/auth'

export default ({ getState }) => {
    return next => action => {
        if (isRSAA(action)) {
            let auth = getState().Auth
            if (auth.access) {
                let exp = moment.unix(auth.access.exp)
                let orig_iat = moment.unix(auth.access.orig_iat)
                let diff = exp.diff(orig_iat, 'minutes')

                if (moment().diff(orig_iat, 'minutes') > (diff-5) && !auth.refresh) {
                    return next(AuthActions.refreshAccessToken(auth.access.token)).then(() => next(action))
                } else {
                    return next(action)
                }
            }
        }
        return next(action)
    }
}