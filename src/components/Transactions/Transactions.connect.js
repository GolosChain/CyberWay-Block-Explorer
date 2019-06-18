import { connect } from 'react-redux';

import Connection from '../../utils/Connection';
import Transactions from './Transactions';

export default connect(
  (state, props) => {
    let transactions = [];

    const transactionsInfo = state.blockTransactions[props.blockId];

    if (transactionsInfo) {
      transactions = transactionsInfo.transactions;
    }

    return {
      transactions,
    };
  },
  {
    loadTransactions: ({ blockId, status }) => async dispatch => {
      const params = {
        blockId,
        status,
        limit: 20,
      };

      const result = await Connection.get().callApi('blocks.getBlockTransactions', params);

      return dispatch({
        type: 'FETCH_TRANSACTIONS_SUCCESS',
        meta: params,
        payload: result,
      });
    },
  }
)(Transactions);
