import { equals } from 'ramda';

import { Action, FiltersType, TransactionType } from '../../types';

import { FETCH_TRANSACTIONS, FETCH_TRANSACTIONS_SUCCESS } from '../constants';

export type State = {
  isLoading: boolean;
  isEnd: boolean;
  filters: FiltersType;
  currentFilters: FiltersType;
  queueId: number;
  blocks: {
    [key: string]: [TransactionType];
  };
};

const initialState: State = {
  isLoading: false,
  isEnd: false,
  filters: {},
  currentFilters: {},
  queueId: 1,
  blocks: {},
};

export default function(state: State = initialState, { type, payload, meta }: Action): State {
  switch (type) {
    case FETCH_TRANSACTIONS: {
      let { queueId } = state;

      if (!equals(state.filters, meta.filters)) {
        queueId++;
      }

      meta.queueId = queueId;

      if (meta.fromIndex) {
        return {
          ...state,
          queueId,
          filters: meta.filters,
          isLoading: true,
        };
      } else {
        return {
          ...initialState,
          queueId,
          filters: meta.filters,
          isLoading: true,
        };
      }
    }
    case FETCH_TRANSACTIONS_SUCCESS: {
      if (meta.queueId !== state.queueId) {
        return state;
      }

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
        currentFilters: meta.filters,
        blocks: {
          ...state.blocks,
          [meta.blockId]: transactions,
        },
      };
    }
    default:
      return state;
  }
}
