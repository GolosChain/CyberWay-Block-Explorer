import { Action, FiltersType, TransactionType } from '../../types';

import { FETCH_ACCOUNT_TRANSACTIONS, FETCH_ACCOUNT_TRANSACTIONS_SUCCESS } from '../constants';
import { equals } from 'ramda';

export type State = {
  isLoading: boolean;
  filters: FiltersType;
  currentFilters: FiltersType;
  queueId: number;
  accountId: string | null;
  sequenceKey: string | null;
  items: TransactionType[];
};

const initialState: State = {
  isLoading: false,
  filters: {},
  currentFilters: {},
  queueId: 1,
  accountId: null,
  sequenceKey: null,
  items: [],
};

export default function(state: State = initialState, { type, payload, meta }: Action): State {
  switch (type) {
    case FETCH_ACCOUNT_TRANSACTIONS:
      let { queueId } = state;

      if (!equals(state.filters, meta.filters) || state.accountId !== meta.accountId) {
        queueId++;
      }

      meta.queueId = queueId;

      if (meta.sequenceKey && meta.accountId === state.accountId) {
        return {
          ...state,
          filters: meta.filters,
          queueId,
          isLoading: true,
        };
      }

      return {
        ...initialState,
        queueId,
        filters: meta.filters,
        isLoading: true,
      };
    case FETCH_ACCOUNT_TRANSACTIONS_SUCCESS:
      if (meta.queueId !== state.queueId) {
        return state;
      }

      let items;

      if (meta.sequenceKey) {
        items = state.items.concat(payload.transactions);
      } else {
        items = payload.transactions;
      }

      return {
        ...state,
        currentFilters: meta.filters,
        isLoading: false,
        accountId: payload.id,
        sequenceKey: payload.sequenceKey,
        items,
      };
    default:
      return state;
  }
}
