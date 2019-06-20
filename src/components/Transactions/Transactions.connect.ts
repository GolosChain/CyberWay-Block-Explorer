import { connect } from 'react-redux';

import { Dispatch, TransactionStatus } from '../../types';
import { State } from '../../store';

import { FETCH_TRANSACTIONS, FETCH_TRANSACTIONS_SUCCESS } from '../../store/constants';
import Connection from '../../utils/Connection';
import Transactions from './Transactions';

export default connect(
  ({ blockTransactions }: State, props: { blockId: string }) => {
    const transactions = blockTransactions.blocks[props.blockId] || [];

    return {
      isLoading: blockTransactions.isLoading,
      isEnd: blockTransactions.isEnd,
      transactions,
    };
  },
  {
    loadTransactions: ({
      blockId,
      status,
      fromIndex,
    }: {
      blockId: string;
      status?: TransactionStatus;
      fromIndex?: number;
    }) => async (dispatch: Dispatch) => {
      const params = {
        blockId,
        status,
        fromIndex,
        limit: 20,
      };

      dispatch({
        type: FETCH_TRANSACTIONS,
        meta: params,
      });

      const result = await Connection.get().callApi('blocks.getBlockTransactions', params);

      dispatch({
        type: FETCH_TRANSACTIONS_SUCCESS,
        meta: params,
        payload: result,
      });
    },
  }
)(Transactions);
