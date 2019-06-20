import { combineReducers } from 'redux';

import blocks, { State as BlocksState } from './blocks';
import blocksFeed, { State as BlocksFeedState } from './blocksFeed';
import transactions, { State as TransactionsState } from './transactions';
import blockTransactions, { State as BlockTransactionsState } from './blockTransactions';
import blockchain, { State as BlockchainState } from './blockchain';

export type State = {
  blocks: BlocksState;
  blocksFeed: BlocksFeedState;
  transactions: TransactionsState;
  blockTransactions: BlockTransactionsState;
  blockchain: BlockchainState;
};

export default combineReducers({
  blocks,
  blocksFeed,
  transactions,
  blockTransactions,
  blockchain,
});
