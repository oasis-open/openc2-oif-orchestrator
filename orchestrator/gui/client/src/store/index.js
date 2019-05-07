import storage from 'redux-persist/es/storage'
import { apiMiddleware, isRSAA } from 'redux-api-middleware'
import { createStore, compose, applyMiddleware } from 'redux'
import { createFilter } from 'redux-persist-transform-filter'
import { persistReducer, persistStore } from 'redux-persist'
import { routerMiddleware } from 'connected-react-router'

import createRootReducer from '../reducers'

import refreshMiddleware from './refreshMiddleware'
// import socketMiddleware from './socketMiddleware'
import asyncDispatchMiddleware from './asyncDispatchMiddleware'

export default (history) => {
    const persistedFilter = createFilter(
        'Auth', ['access']
    );

    const reducer = persistReducer(
        {
            key: 'orc_gui',
            storage: storage,
            whitelist: ['Auth'],
            blacklist: ['Router'],
            transforms: [persistedFilter]
        },
        createRootReducer(history)
    )

    let middleware = [
        refreshMiddleware,
        // socketMiddleware,
        apiMiddleware,
        asyncDispatchMiddleware,
        routerMiddleware(history)
    ]

    /* Logger */
    if (process.env.NODE_ENV === 'development') {
        const { createLogger } = require('redux-logger');

        const logger = createLogger({
            diff: false,
            level: 'info',
            logErrors: true
        });

        console.log('Apply Logger');
        //middleware.push(logger);
    }

    const enhancers = compose(
        applyMiddleware(
            ...middleware
        )
    )


    const store = createStore(
        reducer,
        {},
        enhancers
    )

    persistStore(store)

    return store
}
