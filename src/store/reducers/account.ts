import { Action, AccountType } from '../../types';

import { FETCH_ACCOUNT, FETCH_ACCOUNT_SUCCESS } from '../constants';

export type State = {
  isLoading: boolean;
  isEnd: boolean;
  account: AccountType | null;
};

const initialState: State = {
  isLoading: false,
  isEnd: false,
  account: null,
};

export default function(state: State = initialState, { type, payload, meta }: Action) {
  switch (type) {
    case FETCH_ACCOUNT:
      if (meta.afterTrxId) {
        return {
          ...state,
          isLoading: true,
        };
      }

      return {
        isLoading: true,
        isEnd: false,
        account: null,
      };
    case FETCH_ACCOUNT_SUCCESS:
      let transactions;

      if (meta.afterTrxId && state.account) {
        transactions = state.account.transactions.concat(payload.transactions);
      } else {
        transactions = payload.transactions;
      }

      return {
        isLoading: false,
        isEnd: payload.transactions.length < meta.limit,
        account: {
          id: payload.id,
          transactions,
        },
      };
    default:
      return state;
  }
}
