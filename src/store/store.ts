import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import reducer from './reducers';
import callApiMiddleware from './middlewares/callApi';
import { getHash, parseFilters } from '../utils/filters';
import { AccountTransactionsType } from '../types';
import { TYPE_STORAGE_KEY } from '../constants';

const middlewares = [thunkMiddleware, callApiMiddleware];

if (process.env.NODE_ENV !== 'production' && localStorage.getItem('reduxlogger') !== '0') {
  const { createLogger } = require('redux-logger');
  middlewares.push(createLogger());
}

const initialState = {
  filters: {
    ...parseFilters(getHash()),
    type: (localStorage.getItem(TYPE_STORAGE_KEY) || 'all') as AccountTransactionsType,
  },
};

const store = createStore(reducer, initialState, applyMiddleware(...middlewares));

export function getStore() {
  return store;
}
