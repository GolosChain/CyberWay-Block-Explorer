import { connect } from 'react-redux';

import {
  FETCH_ACCOUNT_TRANSACTIONS,
  FETCH_ACCOUNT_TRANSACTIONS_SUCCESS,
} from '../../store/constants';
import { AccountTransactionsMode, FiltersType } from '../../types';
import { CALL_API } from '../../store/middlewares/callApi';
import { State } from '../../store';

import AccountTransactions from './AccountTransactions';

type Props = {
  accountId: string;
};

export type LOAD_TRANSACTIONS_PARAMS_TYPE = {
  accountId: string;
  mode: AccountTransactionsMode;
  sequenceKey?: string | null;
} & FiltersType;

export default connect(
  ({ accountTransactions, filters }: State, props: Props) => {
    const { accountId } = props;

    let transactions = null;
    let currentFilters = {};

    if (accountTransactions.accountId === accountId) {
      transactions = accountTransactions.items;
      currentFilters = accountTransactions.currentFilters;
    }

    return {
      filters,
      currentFilters,
      transactions,
      sequenceKey: accountTransactions.sequenceKey,
      isLoading: accountTransactions.isLoading,
    };
  },
  {
    loadAccountTransactions: ({
      accountId,
      mode,
      code,
      action,
      actor,
      event,
      sequenceKey,
    }: LOAD_TRANSACTIONS_PARAMS_TYPE) => {
      const filters = {
        code,
        action,
        actor,
        event,
      };

      return {
        type: CALL_API,
        method: 'blocks.getAccountTransactions',
        params: {
          accountId,
          type: mode,
          sequenceKey,
          limit: 5,
          ...filters,
        },
        types: [FETCH_ACCOUNT_TRANSACTIONS, FETCH_ACCOUNT_TRANSACTIONS_SUCCESS, null],
        meta: { accountId, mode, sequenceKey, limit: 5, filters },
      };
    },
  }
)(AccountTransactions);
