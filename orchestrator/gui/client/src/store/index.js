import storage from 'redux-persist/es/storage';
import { createStore, compose, applyMiddleware } from 'redux';
import { apiMiddleware } from 'redux-api-middleware';
import { createFilter } from 'redux-persist-transform-filter';
import thunk from 'redux-thunk';
import { persistReducer, persistStore } from 'redux-persist';
import { routerMiddleware } from 'connected-react-router';

import createRootReducer from '../reducers';
import refreshMiddleware from './refreshMiddleware';
// import socketMiddleware from './socketMiddleware'
import asyncDispatchMiddleware from './asyncDispatchMiddleware';

export default history => {
  const persistedFilter = createFilter(
    'Auth', ['access']
  );

  const reducer = persistReducer(
    {
      key: 'orc_gui',
      storage,
      whitelist: ['Auth'],
      blacklist: ['Router'],
      transforms: [persistedFilter]
    },
    createRootReducer(history)
  );

  const middleware = [
    refreshMiddleware,
    // socketMiddleware,
    apiMiddleware,
    thunk,
    asyncDispatchMiddleware,
    routerMiddleware(history)
  ];

  const extraEnhancers = [];

  /* Logger */
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line global-require
    const { createLogger } = require('redux-logger');
    const logger = createLogger({
      diff: false,
      level: 'info',
      logErrors: true
    });
    middleware.push(logger);
    // extraEnhancers.push(window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
  }

  const enhancers = compose(
    applyMiddleware(
      ...middleware
    ),
    ...extraEnhancers
  );

  const store = createStore(
    reducer,
    {},
    enhancers
  );

  persistStore(store);
  return store;
};
