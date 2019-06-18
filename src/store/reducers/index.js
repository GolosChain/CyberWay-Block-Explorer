import { combineReducers } from 'redux';

import blocks from './blocks';
import blocksFeed from './blocksFeed';
import transactions from './transactions';
import blockTransactions from './blockTransactions';

export default combineReducers({
  blocks,
  blocksFeed,
  transactions,
  blockTransactions,
});
