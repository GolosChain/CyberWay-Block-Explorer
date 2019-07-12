import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import {
  FETCH_ACCOUNT_TRANSACTIONS,
  FETCH_ACCOUNT_TRANSACTIONS_SUCCESS,
  SET_TYPE_FILTER,
} from '../../store/constants';
import { TYPE_STORAGE_KEY } from '../../constants';
import { AccountTransactionsType } from '../../types';
import { CALL_API } from '../../store/middlewares/callApi';
import { State } from '../../store';

import AccountTransactions from './AccountTransactions';

type Props = {
  accountId: string;
};

export type LOAD_TRANSACTIONS_PARAMS_TYPE = {
  accountId: string;
  type?: AccountTransactionsType;
  afterTrxId?: string;
};

export default connect(
  ({ accountTransactions, filters }: State, props: Props) => {
    const { accountId } = props;

    let account = null;

    if (accountTransactions.account && accountTransactions.account.id === accountId) {
      account = accountTransactions.account;
    }

    return {
      filters,
      transactions: account ? account.transactions : null,
      isEnd: accountTransactions.isEnd,
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
    loadAccountTransactions: ({ accountId, type, afterTrxId }: LOAD_TRANSACTIONS_PARAMS_TYPE) => {
      const params = {
        accountId,
        type: type || 'all',
        afterTrxId,
      };

      return {
        type: CALL_API,
        method: 'blocks.getAccountTransactions',
        params,
        types: [FETCH_ACCOUNT_TRANSACTIONS, FETCH_ACCOUNT_TRANSACTIONS_SUCCESS, null],
        meta: { ...params },
      };
    },
  }
)(AccountTransactions);
