import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import { TransactionStatus } from '../../types';
import { State } from '../../store';

import { FETCH_TRANSACTIONS, FETCH_TRANSACTIONS_SUCCESS } from '../../store/constants';
import Connection from '../../utils/Connection';
import Transactions from './Transactions';

export type LoadTransactionsParams = {
  blockId: string;
  status?: TransactionStatus;
  fromIndex?: number;
  code?: string;
  action?: string;
};

export default connect(
  ({ blockTransactions, filters }: State, props: { blockId: string }) => {
    const transactions = blockTransactions.blocks[props.blockId] || [];

    return {
      isLoading: blockTransactions.isLoading,
      isEnd: blockTransactions.isEnd,
      transactions,
      filters,
    };
  },
  {
    loadTransactions: ({
      blockId,
      status,
      fromIndex,
      code,
      action,
    }: LoadTransactionsParams) => async (dispatch: Dispatch) => {
      const params = {
        blockId,
        status,
        fromIndex,
        limit: 20,
        code,
        action,
      };

      const meta = { ...params };

      dispatch({
        type: FETCH_TRANSACTIONS,
        meta,
      });

      const result = await Connection.get().callApi('blocks.getBlockTransactions', params);

      dispatch({
        type: FETCH_TRANSACTIONS_SUCCESS,
        meta,
        payload: result,
      });
    },
  }
)(Transactions);
