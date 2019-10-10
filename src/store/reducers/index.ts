import { combineReducers } from 'redux';

import blocks, { State as BlocksState } from './blocks';
import blocksFeed, { State as BlocksFeedState } from './blocksFeed';
import transactions, { State as TransactionsState } from './transactions';
import blockTransactions, { State as BlockTransactionsState } from './blockTransactions';
import blockchain, { State as BlockchainState } from './blockchain';
import filters, { State as FiltersState } from './filters';
import currentAccount, { State as CurrentAccountState } from './currentAccount';
import accountTransactions, { State as AccountTransactionsState } from './accountTransactions';
import tokenHolders, { State as TokenHoldersState } from './tokenHolders';

export type State = {
  blocks: BlocksState;
  blocksFeed: BlocksFeedState;
  transactions: TransactionsState;
  blockTransactions: BlockTransactionsState;
  blockchain: BlockchainState;
  filters: FiltersState;
  currentAccount: CurrentAccountState;
  accountTransactions: AccountTransactionsState;
  tokenHolders: TokenHoldersState;
};

export default combineReducers({
  blocks,
  blocksFeed,
  transactions,
  blockTransactions,
  blockchain,
  filters,
  currentAccount,
  accountTransactions,
  tokenHolders,
});
