import { Action, AccountType, ApiError } from '../../types';

import { FETCH_ACCOUNT, FETCH_ACCOUNT_ERROR, FETCH_ACCOUNT_SUCCESS } from '../constants';

export type State = {
  account: AccountType | null;
  loadingAccountId: string | null;
  error: ApiError | null;
};

const initialState: State = {
  account: null,
  loadingAccountId: null,
  error: null,
};

export default function(
  state: State = initialState,
  { type, payload, error, meta }: Action
): State {
  switch (type) {
    case FETCH_ACCOUNT:
      return {
        ...state,
        loadingAccountId: meta.accountId,
      };
    case FETCH_ACCOUNT_SUCCESS:
      if (meta.accountId !== state.loadingAccountId) {
        return state;
      }

      return {
        account: payload,
        loadingAccountId: null,
        error: null,
      };

    case FETCH_ACCOUNT_ERROR:
      if (meta.accountId !== state.loadingAccountId) {
        return state;
      }

      return {
        account: payload,
        loadingAccountId: null,
        error: error || null,
      };

    default:
      return state;
  }
}
