import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import reducer from './reducers';
import { getHash, parseFilters } from '../utils/filters';

const middlewares = [thunkMiddleware];

if (process.env.NODE_ENV !== 'production' && localStorage.getItem('reduxlogger') !== '0') {
  const { createLogger } = require('redux-logger');
  middlewares.push(createLogger());
}

const initialState = {
  filters: parseFilters(getHash()),
};

const store = createStore(reducer, initialState, applyMiddleware(...middlewares));

export function getStore() {
  return store;
}
