import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import reducer from './reducers';

const middlewares = [thunkMiddleware];

if (
  process.env.NODE_ENV !== 'production' &&
  // @ts-ignore
  (process.env.REDUX_LOGGER || process.browser)
) {
  // eslint-disable-next-line
  const { createLogger } = require('redux-logger');
  middlewares.push(createLogger());
}

const store = createStore(reducer, {}, applyMiddleware(...middlewares));

export function getStore() {
  return store;
}
