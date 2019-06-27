import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import { State } from '../../store';
import { TransactionRouteParams } from '../../routes/Routes';
import { FETCH_TRANSACTION_SUCCESS } from '../../store/constants';
import Connection from '../../utils/Connection';

import Transaction from './Transaction';

type Props = {
  match: {
    params: TransactionRouteParams;
  };
};

export default connect(
  (state: State, props: Props) => {
    const { transactionId } = props.match.params;

    return {
      transaction: state.transactions[transactionId],
      transactionId,
      filters: state.filters,
    };
  },
  {
    loadTransaction: ({
      transactionId,
      code,
      action,
    }: {
      transactionId: string;
      code?: string;
      action?: string;
    }) => async (dispatch: Dispatch) => {
      const result = await Connection.get().callApi('blocks.getTransaction', {
        transactionId,
        code,
        action,
      });

      dispatch({
        type: FETCH_TRANSACTION_SUCCESS,
        payload: result,
      });
    },
  }
)(Transaction);
