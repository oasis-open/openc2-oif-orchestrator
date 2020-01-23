// Async actions after an api call returns data

export default store => next => action => {
  let syncActivityFinished = false;
  let actionQueue = [];

  let flushQueue = () => {
    actionQueue.forEach(a => store.dispatch(a)) // flush queue
    actionQueue = []
  }

  let asyncDispatch = (asyncAction) => {
    actionQueue = actionQueue.concat([asyncAction])

    if (syncActivityFinished) {
      flushQueue()
    }
  }

  const actionWithAsyncDispatch = Object.assign({}, action, { asyncDispatch })

  next(actionWithAsyncDispatch)
  syncActivityFinished = true
  flushQueue()
}