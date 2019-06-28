import { Action, FiltersType, TransactionType } from '../../types';

import { FETCH_TRANSACTIONS, FETCH_TRANSACTIONS_SUCCESS } from '../constants';

export type State = {
  isLoading: boolean;
  isEnd: boolean;
  filters: FiltersType;
  currentFilters: FiltersType | null;
  queueId: number;
  blocks: {
    [key: string]: [TransactionType];
  };
};

const initialState: State = {
  isLoading: false,
  isEnd: false,
  filters: {},
  currentFilters: null,
  queueId: 1,
  blocks: {},
};

export default function(state: State = initialState, { type, payload, meta }: Action) {
  switch (type) {
    case FETCH_TRANSACTIONS: {
      const filters = { code: meta.code, action: meta.action };
      let { queueId } = state;

      if (state.filters.code !== filters.code || state.filters.action !== filters.action) {
        queueId++;
      }

      meta.queueId = queueId;

      if (meta.fromIndex) {
        return {
          ...state,
          queueId,
          filters,
          isLoading: true,
        };
      } else {
        return {
          ...initialState,
          queueId,
          filters,
          isLoading: true,
        };
      }
    }
    case FETCH_TRANSACTIONS_SUCCESS: {
      if (meta.queueId !== state.queueId) {
        return state;
      }

      let currentFilters = null;

      if (meta.code || meta.action) {
        currentFilters = { code: meta.code, action: meta.action };
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
        currentFilters,
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
