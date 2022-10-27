import storage from 'redux-persist/es/storage';
import {
  Store, StoreEnhancer, applyMiddleware, createStore, compose
} from 'redux';
import { apiMiddleware } from 'redux-api-middleware';
import { createFilter } from 'redux-persist-transform-filter';
import { History, createBrowserHistory } from 'history';
import reduxThunk from 'redux-thunk';
import { persistReducer, persistStore } from 'redux-persist';
import { routerMiddleware } from 'connected-react-router';

import { DispatchAction } from '../actions';
import createRootReducer, { RootState } from '../reducers';
import { asyncDispatchMiddleware } from './middleware';

type OrchestratorStore = Store<RootState, DispatchAction>;
export const history = createBrowserHistory();

export default (his: History = history): OrchestratorStore => {
  const persistedFilter = createFilter(
    'Auth', ['access', 'refresh_token']
  );

  const reducer = persistReducer(
    {
      key: 'orc_gui',
      storage,
      whitelist: ['Auth'],
      blacklist: ['router'],
      transforms: [persistedFilter]
    },
    createRootReducer(his)
  );

  const middleware = [
    apiMiddleware,
    reduxThunk,
    asyncDispatchMiddleware,
    routerMiddleware(his)
  ];

  const extraEnhancers: Array<StoreEnhancer> = [];

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

  const enhancers: StoreEnhancer = compose(
    applyMiddleware(...middleware),
    ...extraEnhancers
  );

  const store = createStore(
    reducer,
    {},
    enhancers
  ) as OrchestratorStore;
  persistStore(store);
  return store;
};
