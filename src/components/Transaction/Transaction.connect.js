import { connect } from 'react-redux';

import Connection from '../../utils/Connection';
import Transaction from './Transaction';

export default connect(
  (state, props) => {
    const { transactionId } = props.match.params;

    return {
      transaction: state.transactions[transactionId],
      transactionId,
    };
  },
  {
    loadTransaction: ({ transactionId }) => async dispatch => {
      const result = await Connection.get().callApi('blocks.getTransaction', {
        transactionId,
      });

      return dispatch({
        type: 'FETCH_TRANSACTION_SUCCESS',
        payload: result,
      });
    },
  }
)(Transaction);
