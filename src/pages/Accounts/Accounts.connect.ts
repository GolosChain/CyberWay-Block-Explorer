import { connect } from 'react-redux';

import { CALL_API } from '../../store/middlewares/callApi';
import {
  FETCH_ACCOUNTS,
  FETCH_ACCOUNTS_SUCCESS,
  FETCH_ACCOUNTS_ERROR,
} from '../../store/constants';
import { State } from '../../store';

import Accounts from './Accounts';

export const ACCOUNTS_LIMIT = 30;

export type LoadAccountsParams = { prefix?: string | null };

export default connect(
  ({ accounts }: State) => {
    return {
      items: accounts.items,
      isLoading: accounts.isLoading,
    };
  },
  {
    loadAccounts: ({ prefix }: LoadAccountsParams) => {
      const params = {
        prefix,
        limit: ACCOUNTS_LIMIT,
      };

      return {
        type: CALL_API,
        method: 'accounts.getAccounts',
        params,
        types: [FETCH_ACCOUNTS, FETCH_ACCOUNTS_SUCCESS, FETCH_ACCOUNTS_ERROR],
        meta: { ...params },
      };
    },
  }
)(Accounts);
