import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import {
  FETCH_ACCOUNT_TRANSACTIONS,
  FETCH_ACCOUNT_TRANSACTIONS_SUCCESS,
  SET_TYPE_FILTER,
} from '../../store/constants';
import { TYPE_STORAGE_KEY } from '../../constants';
import { AccountTransactionsType, FiltersType } from '../../types';
import { CALL_API } from '../../store/middlewares/callApi';
import { State } from '../../store';

import AccountTransactions from './AccountTransactions';

type Props = {
  accountId: string;
};

export type LOAD_TRANSACTIONS_PARAMS_TYPE = {
  accountId: string;
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
    changeType: (type: AccountTransactionsType) => (dispatch: Dispatch) => {
      localStorage.setItem(TYPE_STORAGE_KEY, type);

      dispatch({
        type: SET_TYPE_FILTER,
        payload: {
          type,
        },
      });
    },
    loadAccountTransactions: ({
      accountId,
      type,
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
        type: type || 'all',
      };

      return {
        type: CALL_API,
        method: 'blocks.getAccountTransactions',
        params: {
          accountId,
          sequenceKey,
          limit: 5,
          ...filters,
        },
        types: [FETCH_ACCOUNT_TRANSACTIONS, FETCH_ACCOUNT_TRANSACTIONS_SUCCESS, null],
        meta: { accountId, sequenceKey, limit: 5, filters },
      };
    },
  }
)(AccountTransactions);
