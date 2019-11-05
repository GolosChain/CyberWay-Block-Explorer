// @ts-ignore
import u from 'updeep';

import { Action, ExtendedAccountType, ApiError, GrantInfoType } from '../../types';

import {
  FETCH_ACCOUNT,
  FETCH_ACCOUNT_ERROR,
  FETCH_ACCOUNT_SUCCESS,
  CHANGE_GRANT_STATE,
} from '../constants';

export type State = {
  account: ExtendedAccountType | null;
  loadingName: string | null;
  error: ApiError | null;
};

const initialState: State = {
  account: null,
  loadingName: null,
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
        loadingName: meta.name,
      };
    case FETCH_ACCOUNT_SUCCESS:
      if (meta.name !== state.loadingName) {
        return state;
      }

      return {
        account: payload,
        loadingName: null,
        error: null,
      };

    case FETCH_ACCOUNT_ERROR:
      if (meta.name !== state.loadingName) {
        return state;
      }

      return {
        account: payload,
        loadingName: null,
        error: error || null,
      };

    case CHANGE_GRANT_STATE:
      const { accountId, recipientId, share, percent } = payload;

      if (!state.account || !state.account.grants || state.account.id !== accountId) {
        return state;
      }

      return u.updateIn(
        ['account', 'grants', 'items'],
        (items: GrantInfoType[]) =>
          items.map(grant => {
            if (grant.recipient !== recipientId) {
              return grant;
            }

            return {
              ...grant,
              isCanceled: true,
              share: share !== null ? share : grant.share,
              percent: percent !== null ? percent : grant.percent,
            };
          }),
        state
      );

    default:
      return state;
  }
}
