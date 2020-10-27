// Async actions after an api call returns data
export default store => next => action => {
  let syncActivityFinished = false;
  let actionQueue = [];

  const flushQueue = () => {
    actionQueue.forEach(a => store.dispatch(a)); // flush queue
    actionQueue = [];
  };

  const asyncDispatch = asyncAction => {
    actionQueue = actionQueue.concat([asyncAction]);

    if (syncActivityFinished) {
      flushQueue();
    }
  };

  const actionWithAsyncDispatch = {
    ...action,
    asyncDispatch
  };

  next(actionWithAsyncDispatch);
  syncActivityFinished = true;
  flushQueue();
};