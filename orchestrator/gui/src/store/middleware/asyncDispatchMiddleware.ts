// Async actions after an api call returns data
import { Dispatch, Middleware, MiddlewareAPI } from 'redux';
import { RSAAAction } from 'redux-api-middleware';
import { DispatchAction, Interface } from '../../actions';

type DispatchTyped = Dispatch<DispatchAction>;
type AsyncActions = Interface.BasicAction | RSAAAction;

function asyncDispatchMiddleware(api: MiddlewareAPI<DispatchTyped>): ReturnType<Middleware> {
  return (next: DispatchTyped) => (action: DispatchAction) => {
    let syncActivityFinished = false;
    let actionQueue: Array<AsyncActions> = [];

    const flushQueue = () => {
      actionQueue.forEach(a => api.dispatch(a as DispatchAction)); // flush queue
      actionQueue = [];
    };

    const asyncDispatch = (asyncAction: AsyncActions) => {
      actionQueue = actionQueue.concat([asyncAction]);

      if (syncActivityFinished) {
        flushQueue();
      }
    };

    const actionWithAsyncDispatch: DispatchAction = {
      ...action,
      asyncDispatch
    };

    next(actionWithAsyncDispatch);
    syncActivityFinished = true;
    flushQueue();
  };
}

export default asyncDispatchMiddleware;