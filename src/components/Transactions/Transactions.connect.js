import { connect } from 'react-redux';

import Connection from '../../utils/Connection';
import Transactions from './Transactions';

export default connect(
  (state, props) => {
    const transactions = state.blockTransactions.blocks[props.blockId] || [];

    return {
      transactions,
    };
  },
  {
    loadTransactions: ({ blockId, status, fromIndex }) => async dispatch => {
      const params = {
        blockId,
        status,
        fromIndex,
        limit: 20,
      };

      dispatch({
        type: 'FETCH_TRANSACTIONS',
        meta: params,
      });

      const result = await Connection.get().callApi('blocks.getBlockTransactions', params);

      dispatch({
        type: 'FETCH_TRANSACTIONS_SUCCESS',
        meta: params,
        payload: result,
      });
    },
  }
)(Transactions);
