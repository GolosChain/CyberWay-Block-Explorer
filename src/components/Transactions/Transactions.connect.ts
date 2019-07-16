import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import { State } from '../../store';

import { FETCH_TRANSACTIONS, FETCH_TRANSACTIONS_SUCCESS } from '../../store/constants';
import Connection from '../../utils/Connection';
import Transactions from './Transactions';

export type LoadTransactionsParams = {
  blockId: string;
  fromIndex?: number;
  code?: string;
  action?: string;
  actor?: string;
  event?: string;
};

export default connect(
  ({ blockTransactions, filters }: State, props: { blockId: string }) => {
    const transactions = blockTransactions.blocks[props.blockId] || [];

    return {
      isLoading: blockTransactions.isLoading,
      isEnd: blockTransactions.isEnd,
      currentFilters: blockTransactions.currentFilters,
      transactions,
      filters,
    };
  },
  {
    loadTransactions: ({
      blockId,
      fromIndex,
      code,
      action,
      actor,
      event,
    }: LoadTransactionsParams) => async (dispatch: Dispatch) => {
      const meta = {
        blockId,
        fromIndex,
        limit: 20,
        filters: {
          code,
          action,
          actor,
          event,
        },
      };

      dispatch({
        type: FETCH_TRANSACTIONS,
        meta,
      });

      const result = await Connection.get().callApi('blocks.getBlockTransactions', {
        blockId,
        fromIndex,
        limit: 20,
        ...meta.filters,
      });

      dispatch({
        type: FETCH_TRANSACTIONS_SUCCESS,
        meta,
        payload: result,
      });
    },
  }
)(Transactions);
