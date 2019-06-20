import { Action, TransactionType } from '../../types';

import { FETCH_TRANSACTIONS, FETCH_TRANSACTIONS_SUCCESS } from '../constants';

export type State = {
  isLoading: boolean;
  isEnd: boolean;
  blocks: {
    [key: string]: [TransactionType];
  };
};

const initialState: State = {
  isLoading: false,
  isEnd: false,
  blocks: {},
};

export default function(state: State = initialState, { type, payload, meta }: Action) {
  switch (type) {
    case FETCH_TRANSACTIONS:
      if (meta.fromIndex) {
        return {
          ...state,
          isLoading: true,
        };
      } else {
        return {
          ...initialState,
          isLoading: true,
        };
      }
    case FETCH_TRANSACTIONS_SUCCESS:
      let transactions;

      if (meta.fromIndex) {
        transactions = (state.blocks[meta.blockId] || []).concat(payload.transactions);
      } else {
        transactions = payload.transactions;
      }

      return {
        ...state,
        isLoading: false,
        isEnd: payload.transactions.length < meta.limit,
        blocks: {
          ...state.blocks,
          [meta.blockId]: transactions,
        },
      };
    default:
      return state;
  }
}
